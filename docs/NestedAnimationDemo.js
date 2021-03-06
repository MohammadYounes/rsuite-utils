import React from 'react';
import Slide from '../src/Animation/Slide';

const Panel = ({ ...props }) => (
  <div
    {...props}
    className={`${props.className} nested`}
    style={{
      background: '#000',
      width: 100,
      overflow: 'hidden'
    }}
  >
    <p className="child">Panel</p>
    <p>Content Content Content</p>
  </div>
);

class NestedAnimationDemo extends React.Component {
  constructor(props) {
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
    this.state = {
      show: true
    };
  }

  handleToggle() {
    this.setState({
      show: !this.state.show
    });
  }

  render() {
    return (
      <div className="row" style={{ height: 200 }}>
        <h2>Nested Animation</h2>
        <button onClick={this.handleToggle}>toggle</button>
        <Slide
          in={this.state.show}
          timeout={null}
          onEnter={() => {
            console.log(1);
          }}
          onEntering={() => {
            console.log(2);
          }}
          onEntered={() => {
            console.log(3);
          }}
          onExit={() => {
            console.log(4);
          }}
          onExiting={() => {
            console.log(5);
          }}
          onExited={() => {
            console.log(6);
          }}
        >
          <Panel />
        </Slide>
      </div>
    );
  }
}

export default NestedAnimationDemo;
