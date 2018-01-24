
// @flow

import * as React from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import _ from 'lodash';
import Overlay from './Overlay';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import createChainedFunction from '../utils/createChainedFunction';
import handleMouseOverOut from '../utils/handleMouseOverOut';
import isOneOf from '../utils/isOneOf';

type Props = {
  target?: () => void,
  container?: React.ElementType | Function,
  containerPadding?: number,
  placement?: 'top' | 'right' | 'bottom' | 'left',
  show?: boolean,
  rootClose?: boolean,
  onHide?: () => void,
  transition?: React.ElementType,
  onEnter?: () => void,
  onEntering?: () => void,
  onEntered?: () => void,
  onExit?: () => void,
  onExiting?: () => void,
  onExited?: () => void,
  animation?: React.ElementType | boolean,
  trigger?: 'click' | 'hover' | 'focus' | Array<'click' | 'hover' | 'focus'>,
  delay?: number,
  delayShow?: number,
  delayHide?: number,
  defaultOverlayShown?: boolean,
  speaker: React.Element<any>,
  children: React.Node,
  onMouseOver?: (event: SyntheticEvent<*>) => void,
  onMouseOut?: (event: SyntheticEvent<*>) => void,
  onClick?: (event: SyntheticEvent<*>) => void,
  onBlur?: (event: SyntheticEvent<*>) => void,
  onFocus?: (event: SyntheticEvent<*>) => void
}

type WhisperProps = {
  'aria-describedby': string,
  onMouseOver?: (event: SyntheticEvent<*>) => void,
  onMouseOut?: (event: SyntheticEvent<*>) => void,
  onBlur?: (event: SyntheticEvent<*>) => void,
  onClick?: (event: SyntheticEvent<*>) => void,
  onFocus?: (event: SyntheticEvent<*>) => void,
}

type States = {
  isOverlayShown?: boolean,
  isOnSpeaker?: boolean
}

class Whisper extends React.Component<Props, States> {

  static defaultProps = {
    defaultOverlayShown: false,
    trigger: ['hover', 'focus'],
    delayHide: 200,
    rootClose: true
  };

  constructor(props: Props) {
    super(props);

    this.handleMouseOver = (e: SyntheticEvent<*>) => handleMouseOverOut(this.handleDelayedShow, e);
    this.handleMouseOut = (e: SyntheticEvent<*>) => handleMouseOverOut(this.handleDelayedHide, e);

    this.state = {
      isOverlayShown: props.defaultOverlayShown
    };
    this.mountNode = null;
  }

  componentDidMount() {
    this.mountNode = document.createElement('div');
    this.renderOverlay();
  }

  componentDidUpdate() {
    if (this.mountNode) {
      this.renderOverlay();
    }
  }

  componentWillUnmount() {
    ReactDOM.unmountComponentAtNode(this.mountNode);
    this.mountNode = null;
    clearTimeout(this.hoverShowDelay);
    clearTimeout(this.hoverHideDelay);
  }

  getOverlayTarget = () => findDOMNode(this) // eslint-disable-line react/no-find-dom-node


  getOverlay() {


    const overlayProps = {
      ..._.pick(this.props, Object.keys(Overlay.propTypes)),
      show: this.state.isOverlayShown,
      onHide: this.handleHide,
      target: this.getOverlayTarget
    };

    const { speaker } = this.props;
    const speakerProps = {
      placement: overlayProps.placement,
      onMouseEnter: this.handleSpeakerMouseOver,
      onMouseLeave: this.handleSpeakerMouseOut
    };

    return (
      <Overlay
        {...overlayProps}
      >
        {React.cloneElement(speaker, speakerProps)}
      </Overlay>
    );
  }

  mountNode = null;
  speaker = null;
  handleMouseOver = null;
  handleMouseOut = null;
  hoverShowDelay = null;
  hoverHideDelay = null;

  handleSpeakerMouseOver = () => {
    this.setState({ isOnSpeaker: true });
  }
  handleSpeakerMouseOut = () => {
    this.hide();
    this.setState({ isOnSpeaker: false });
  }

  hide() {
    this.setState({ isOverlayShown: false });
  }

  show() {
    this.setState({ isOverlayShown: true });
  }

  handleHide = () => {
    this.hide();
  }

  handleToggle = () => {
    if (this.state.isOverlayShown) {
      this.hide();
    } else {
      this.show();
    }
  }

  handleDelayedShow = () => {

    const { delayShow, delay } = this.props;
    if (!isNullOrUndefined(this.hoverHideDelay)) {
      clearTimeout(this.hoverHideDelay);
      this.hoverHideDelay = null;
      this.show();
      return;
    }

    if (this.state.isOverlayShown) {
      return;
    }

    const nextDelay = !isNullOrUndefined(delayShow) ? delayShow : delay;

    if (!nextDelay) {
      this.show();
      return;
    }

    this.hoverShowDelay = setTimeout(() => {
      this.hoverShowDelay = null;
      this.show();
    }, nextDelay);

  }

  handleDelayedHide = () => {

    const { delayHide, delay } = this.props;

    if (!isNullOrUndefined(this.hoverShowDelay)) {
      clearTimeout(this.hoverShowDelay);
      this.hoverShowDelay = null;
      return;
    }

    if (!this.state.isOverlayShown || !isNullOrUndefined(this.hoverHideDelay)) {
      return;
    }

    const nextDelay = !isNullOrUndefined(delayHide) ? delayHide : delay;

    if (!nextDelay) {
      this.hide();
      return;
    }

    this.hoverHideDelay = setTimeout(() => {
      let { isOnSpeaker } = this.state;
      if (isOnSpeaker) {
        return;
      }
      clearTimeout(this.hoverHideDelay);
      this.hoverHideDelay = null;
      this.hide();
    }, nextDelay);
  }

  renderOverlay() {
    if (this.speaker) {
      ReactDOM.unstable_renderSubtreeIntoContainer(this, this.speaker, this.mountNode);
    }
  }

  render() {
    const {
      children,
      speaker,
      onClick,
      trigger,
      onMouseOver,
      onMouseOut,
      onFocus,
      onBlur
    } = this.props;

    const triggerComponent = React.Children.only(children);
    const triggerProps = triggerComponent.props;

    const props: WhisperProps = {
      'aria-describedby': _.get(speaker, ['props', 'id'])
    };

    this.speaker = this.getOverlay();

    props.onClick = createChainedFunction(triggerProps.onClick, onClick);

    if (isOneOf('click', trigger)) {
      props.onClick = createChainedFunction(this.handleToggle, props.onClick);
    }

    if (isOneOf('hover', trigger)) {
      props.onMouseOver = createChainedFunction(
        this.handleMouseOver,
        onMouseOver,
        triggerProps.onMouseOver
      );
      props.onMouseOut = createChainedFunction(
        this.handleMouseOut,
        onMouseOut,
        triggerProps.onMouseOut
      );
    }

    if (isOneOf('focus', trigger)) {

      props.onFocus = createChainedFunction(
        this.handleDelayedShow,
        onFocus,
        triggerProps.onFocus
      );

      props.onBlur = createChainedFunction(
        this.handleDelayedHide,
        onBlur,
        triggerProps.onBlur
      );
    }

    return React.cloneElement(triggerComponent, props);
  }
}

export default Whisper;
