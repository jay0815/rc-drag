import { cloneElement, useLayoutEffect, useRef, Children } from 'react';
import type { ReactElement, FC } from 'react';
import { matchesSelectorAndParentsTo } from './utils/dom';

export type NativeMouseTouchEvent = MouseEvent & TouchEvent;

export type NativeEventHandler<T> = (e: T) => void | false;

export type DraggableData = {
  node: HTMLElement;
  x: number;
  y: number,
  deltaX: number;
  deltaY: number;
  lastX: number;
  lastY: number;
};

export type DraggableEventHandler = (e: MouseEvent, data: DraggableData) => void | false;

export interface DraggableCoreProps {
    onStart: DraggableEventHandler;
    onDrag: DraggableEventHandler;
    onStop: DraggableEventHandler;
    onMouseDown: (e: MouseEvent) => void;

    children: ReactElement<any>;
    offsetParent: HTMLElement;

    allowAnyClick: boolean;
    disabled: boolean;
    enableUserSelectHack: boolean;

    cancel: string;
    handle: string;
    scale: number;
    grid: [number, number];
};


const useDragFns = (props: DraggableCoreProps) => {

    const mounted = useRef(false);
    // uuid
    const uuid = useRef(Date.now().toString());
    // target sibling element ref
    const sibling = useRef<HTMLDivElement>(null);

    const dragTargetNode = () => {
        if (sibling.current) {
            if (sibling.current.previousElementSibling) {
                const preSiblingElement = sibling.current.previousElementSibling;
                if (preSiblingElement.getAttribute('uuid') === uuid.current) {
                    return preSiblingElement;
                }
            }
        }
        return null;
    }

    const handleDragStart: NativeEventHandler<NativeMouseTouchEvent>  = (e) => {
    props.onMouseDown(e);
    // 0: No button or un-initialized
    // 1: Primary button (usually the left button)
    // 2: Secondary button (usually the right button)
    // 4: Auxiliary button (usually the mouse wheel button or middle button)
    // 8: 4th button (typically the "Browser Back" button)
    // 16 : 5th button (typically the "Browser Forward" button)
    // Only accept left-clicks.
    if (!props.allowAnyClick && typeof e.button === 'number' && e.button !== 0) {
        return false;
    }

    // Get nodes. Be sure to grab relative document (could be iframe)
    const target = dragTargetNode();
    if (!target || !target.ownerDocument || !target.ownerDocument.body) {
      throw new Error('<DraggableCore> not mounted on DragStart!');
    }
    const { ownerDocument } = target;

    // Short circuit if handle or cancel prop was provided and selector doesn't match.
    if (props.disabled ||
      (!(ownerDocument.defaultView && e.target instanceof ownerDocument.defaultView.Node)) ||
      (props.handle && !matchesSelectorAndParentsTo(e.target, props.handle, target)) ||
      (props.cancel && matchesSelectorAndParentsTo(e.target, props.cancel, target))) {
      return;
    }

    // Prevent scrolling on mobile devices, like ipad/iphone.
    // Important that this is after handle/cancel.
    if (e.type === 'touchstart') e.preventDefault();

    // Set touch identifier in component state if this is a touch event. This allows us to
    // distinguish between individual touches on multitouch screens by identifying which
    // touchpoint was set to this element.
    // const touchIdentifier = getTouchIdentifier(e);
    // this.setState({touchIdentifier});

    // // Get the current drag point from the event. This is used as the offset.
    // const position = getControlPosition(e, touchIdentifier, this);
    // if (position == null) return; // not possible but satisfies flow
    // const {x, y} = position;

    // // Create an event object with all the data parents need to make a decision here.
    // const coreEvent = createCoreData(this, x, y);

    // // log('DraggableCore: handleDragStart: %j', coreEvent);

    // // Call event handler. If it returns explicit false, cancel.
    // // log('calling', props.onStart);
    // const shouldUpdate = props.onStart(e, coreEvent);
    // if (shouldUpdate === false || this.mounted === false) return;

    // // Add a style to the body to disable user-select. This prevents text from
    // // being selected all over the page.
    // if (props.enableUserSelectHack) addUserSelectStyles(ownerDocument);

    // // Initiate dragging. Set the current x and y as offsets
    // // so we know how much we've moved during the drag. This allows us
    // // to drag elements around even if they have been moved, without issue.
    // this.setState({
    //   dragging: true,

    //   lastX: x,
    //   lastY: y
    // });

    // // Add events to the document directly so we catch when the user's mouse/touch moves outside of
    // // this element. We use different events depending on whether or not we have detected that this
    // // is a touch-capable device.
    // addEvent(ownerDocument, dragEventFor.move, this.handleDrag);
    // addEvent(ownerDocument, dragEventFor.stop, this.handleDragStop);
  };

//   handleDrag: EventHandler<MouseTouchEvent> = (e) => {

//     // Get the current drag point from the event. This is used as the offset.
//     const position = getControlPosition(e, this.state.touchIdentifier, this);
//     if (position == null) return;
//     let {x, y} = position;

//     // Snap to grid if prop has been provided
//     if (Array.isArray(props.grid)) {
//       let deltaX = x - this.state.lastX, deltaY = y - this.state.lastY;
//       [deltaX, deltaY] = snapToGrid(props.grid, deltaX, deltaY);
//       if (!deltaX && !deltaY) return; // skip useless drag
//       x = this.state.lastX + deltaX, y = this.state.lastY + deltaY;
//     }

//     const coreEvent = createCoreData(this, x, y);

//     // log('DraggableCore: handleDrag: %j', coreEvent);

//     // Call event handler. If it returns explicit false, trigger end.
//     const shouldUpdate = props.onDrag(e, coreEvent);
//     if (shouldUpdate === false || this.mounted === false) {
//       try {
//         // $FlowIgnore
//         this.handleDragStop(new MouseEvent('mouseup'));
//       } catch (err) {
//         // Old browsers
//         const event = ((document.createEvent('MouseEvents'): any): MouseTouchEvent);
//         // I see why this insanity was deprecated
//         // $FlowIgnore
//         event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
//         this.handleDragStop(event);
//       }
//       return;
//     }

//     this.setState({
//       lastX: x,
//       lastY: y
//     });
//   };

//   handleDragStop: EventHandler<MouseTouchEvent> = (e) => {
//     if (!this.state.dragging) return;

//     const position = getControlPosition(e, this.state.touchIdentifier, this);
//     if (position == null) return;
//     let {x, y} = position;

//     // Snap to grid if prop has been provided
//     if (Array.isArray(props.grid)) {
//       let deltaX = x - this.state.lastX || 0;
//       let deltaY = y - this.state.lastY || 0;
//       [deltaX, deltaY] = snapToGrid(props.grid, deltaX, deltaY);
//       x = this.state.lastX + deltaX, y = this.state.lastY + deltaY;
//     }

//     const coreEvent = createCoreData(this, x, y);

//     // Call event handler
//     const shouldContinue = props.onStop(e, coreEvent);
//     if (shouldContinue === false || this.mounted === false) return false;

//     const thisNode = this.findDOMNode();
//     if (thisNode) {
//       // Remove user-select hack
//       if (props.enableUserSelectHack) removeUserSelectStyles(thisNode.ownerDocument);
//     }


//     // Reset the el.
//     this.setState({
//       dragging: false,
//       lastX: NaN,
//       lastY: NaN
//     });

//     if (thisNode) {
//       // Remove event handlers
//       removeEvent(thisNode.ownerDocument, dragEventFor.move, this.handleDrag);
//       removeEvent(thisNode.ownerDocument, dragEventFor.stop, this.handleDragStop);
//     }
//   };

//   onMouseDown: EventHandler<MouseTouchEvent> = (e) => {
//     dragEventFor = eventsFor.mouse; // on touchscreen laptops we could switch back to mouse

//     return this.handleDragStart(e);
//   };

//   onMouseUp: EventHandler<MouseTouchEvent> = (e) => {
//     dragEventFor = eventsFor.mouse;

//     return this.handleDragStop(e);
//   };

//   // Same as onMouseDown (start drag), but now consider this a touch device.
//   onTouchStart: EventHandler<MouseTouchEvent> = (e) => {
//     // We're on a touch device now, so change the event handlers
//     dragEventFor = eventsFor.touch;

//     return this.handleDragStart(e);
//   };

//   onTouchEnd: EventHandler<MouseTouchEvent> = (e) => {
//     // We're on a touch device now, so change the event handlers
//     dragEventFor = eventsFor.touch;

//     return this.handleDragStop(e);
//   };
}

const Core: FC<DraggableCoreProps> = ({ children }) => {

    const mounted = useRef(false);
    // uuid
    const uuid = useRef(Date.now().toString());
    // target sibling element ref
    const sibling = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!mounted.current) {
            if (children) {
                if (sibling.current && sibling.current.previousElementSibling) {
                    mounted.current = true;
                    sibling.current.previousElementSibling.setAttribute('uuid', uuid.current);
                    // addEventListener
                }
            }
        }
        return () => {
            mounted.current = false;
        }
    }, [children])
    
    console.log('sibling', sibling)

	return <>
    {cloneElement(Children.only(children), {})}
    <div ref={sibling} style={{ display: 'none' }}/>
    </>;
};

export default Core;
