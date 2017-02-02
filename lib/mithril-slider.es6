import m from 'mithril';
import Hammer from 'hammerjs';

const createView = (ctrl, opts) => {
    const contentEl = ctrl.contentEl();
    const currentIndex = ctrl.index();
    // sizes need to be set each redraw because of screen resizes
    ctrl.groupBy(opts.groupBy || 1);

    if (contentEl) {
        ctrl.updateContentSize(contentEl);
    }
    return m('div', {
        class: [ 'slider', opts.class || '' ].join(' ')
    }, opts.before ? m('.before', opts.before) : null, m('.content', {
        config: (el, inited, context) => {
            if (inited) {
                return;
            }
            ctrl.setContentEl(el);
            const mc = new Hammer.Manager(el, {});
            mc.add(new Hammer.Pan({
                direction: opts.orientation === 'vertical'
                    ? Hammer.DIRECTION_VERTICAL
                    : opts.orientation === 'all'
                        ? Hammer.DIRECTION_ALL
                        : Hammer.DIRECTION_HORIZONTAL,
                threshold: 0
            }));
            mc.on('panmove', ctrl.handleDrag);
            mc.on('panend', ctrl.handleDragEnd);
            mc.on('panstart', ctrl.handleDragStart);
            context.onunload = () => {
                mc.off('panmove', ctrl.handleDrag);
                mc.off('panend', ctrl.handleDragEnd);
                mc.off('panstart', ctrl.handleDragStart);
            };
        }
    },
        ctrl.list.map((data, listIndex) => {
            return opts.page({
                data: data,
                listIndex: listIndex,
                currentIndex: currentIndex
            });
        })
    ),
        opts.after ? m('.after', opts.after) : null);
};

const slider = {};

slider.controller = (opts = {}) => {
    const defaultDuration = parseInt(opts.duration, 10) || 160;
    const index = m.prop(opts.index || -1);
    const listQuery = opts.pageData();
    const list = [];
    const contentEl = m.prop();
    let pageSize = 0;
    const groupBy = m.prop(opts.groupBy || 1);
    const cancelDragFactor = opts.cancelDragFactor || (1 / 5);
    const isVertical = opts.orientation === 'vertical';
    const dir = opts.rtl ? -1 : 1;
    const reduceLength = opts.reduceLength || null;
    const centerIndex = opts.centerIndex || null;

    let containerWidth = null;

    const setIndex = (idx) => {
        const oldIndex = index();
        if (oldIndex !== idx) {
            index(idx);
            m.redraw();
            if (opts.getState) {
                const el = contentEl();
                const page = getPageEl(el, index());
                opts.getState({
                    index: idx,
                    hasNext: hasNext(),
                    hasPrevious: hasPrevious(),
                    pageEl: page
                });
            }
        }
    };

    listQuery.then((listData) => {
        list.splice(0, 0, ...listData);
        if (index() < 0) {
            setIndex(0);
        }
        m.redraw();
    });

    const getPageEl = (el, idx) => el.childNodes[ idx ];

    const getLength = () => {
        if (reduceLength === null) return list.length;
        return list.length - reduceLength;
    }

    const setTransitionStyle = (el, value) => {
        const style = el.style;
        const createAttrs = () => {
            const x = isVertical ? '0' : value + 'px';
            const y = isVertical ? value + 'px' : '0';
            const z = '0';
            const attrs = [ x, y, z ].join(', ');
            return 'translate3d(' + attrs + ')';
        };
        style.transform = style[ '-webkit-transform' ] = style[ '-moz-transform' ] = style[ '-ms-transform' ] = createAttrs();
    };

    const setTransitionDurationStyle = (duration) => {
        contentEl().style[ '-webkit-transition-duration' ] = contentEl().style[ 'transition-duration' ] = duration + 'ms';
    };
    const getOffset = (el,idx) => {
        if (centerIndex !== null) {
            const pageToCenter = el.children[ idx + centerIndex ];
            if (pageToCenter) {
                if (containerWidth === null) {
                    const container = contentEl().parentElement;
                    if (container) {
                        containerWidth = container.clientWidth;
                    }
                }
                if (containerWidth) {
                    return (containerWidth / 2 - pageToCenter.clientWidth / 2) - pageToCenter.offsetLeft;
                }
            }
        }
        return -dir * idx * pageSize;
    }
    const goTo = (idx, duration) => {
        if (idx < 0 || idx > getLength() - 1) {
            return;
        }
        if (duration !== undefined) {
            setTransitionDurationStyle(duration);
        }
        const el = contentEl();
        let newOffset = getOffset(el,idx);
        setTransitionStyle(el, newOffset);
        setIndex(idx);
    };

    const normalizedStep = (orientation) => {
        const idx = index();
        const size = groupBy();
        const min = 0;
        const max = getLength();
        const next = idx + (orientation * size);
        // make sure that last item aligns at the right
        if ((next + size) > max) {
            return max - size;
        }
        if (next < min) {
            return min;
        }
        return next;
    };

    const updateContentSize = (el) => {
        if (el.childNodes.length > 0) {
            const page = el.childNodes[ 0 ];
            const prop = isVertical ? 'height' : 'width';
            pageSize = page.getBoundingClientRect()[ prop ];
            el.style[ prop ] = (list.length * pageSize) + 'px';
        }
    };

    const goCurrent = (duration = 0) => {
        updateContentSize(contentEl());
        setTransitionDurationStyle(duration);
        goTo(normalizedStep(0));
    };

    const goNext = (duration = defaultDuration) => (
        setTransitionDurationStyle(duration),
        index() < getLength() ? goTo(normalizedStep(1)) : goTo(normalizedStep(0))
    );

    const goPrevious = (duration = defaultDuration) => (
        setTransitionDurationStyle(duration),
        index() > 0 ? goTo(normalizedStep(-1)) : goTo(normalizedStep(0))
    );

    const hasNext = () => index() + groupBy() < getLength();

    const hasPrevious = () => index() > 0;

    const setContentEl = (el) => {
        contentEl(el);
        if (list.length > 0) {
            updateContentSize(el);
            goCurrent(0);
        }
    };

    const handleDragStart = () => (setTransitionDurationStyle(0));

    const handleDrag = (e) => {
        const el = contentEl();
        const page = getPageEl(el, index());
        const delta = isVertical ? e.deltaY : e.deltaX;
        // const origin = isVertical
        //     ? page.offsetTop
        //     : (dir === -1) ? (page.offsetLeft - page.parentNode.clientWidth + page.clientWidth) : page.offsetLeft;

        const origin = getOffset(el,index());
        setTransitionStyle(el, delta + origin);
        e.preventDefault();
    };

    const calculateTransitionDuration = (velocity) => {
        const el = contentEl();
        const page = getPageEl(el, index());
        const width = page.clientWidth;
        const speed = Math.abs(velocity) || 1;
        let duration = 1 / speed * width;
        if (duration > defaultDuration) {
            duration = defaultDuration;
        }
        return duration;
    };

    const handleDragEnd = (e) => {
        const duration = calculateTransitionDuration(e.velocity);
        let delta = isVertical ? e.deltaY : e.deltaX;
        if (Math.abs(delta) > pageSize * groupBy() * cancelDragFactor) {
            if (dir * delta < 0) {
                while ((dir * delta) < 0) {
                    goNext(duration);
                    delta += dir * pageSize * groupBy();
                }
            } else {
                while ((dir * delta) > 0) {
                    goPrevious(duration);
                    delta -= dir * pageSize * groupBy();
                }
            }
        } else {
            goCurrent(duration);
        }
    };

    return {
        // component methods
        list,
        contentEl,
        setContentEl,
        handleDrag,
        handleDragStart,
        handleDragEnd,
        groupBy,
        updateContentSize,

        // public interface
        index,
        hasNext,
        hasPrevious,
        goTo,
        goCurrent,
        goNext,
        goPrevious
    };
};

slider.view = (ctrl, opts) => {
    if (opts.sliderController) {
        opts.sliderController(ctrl);
    }
    return createView(ctrl, opts);
};

export default slider;
