import React, { useRef } from "react";
import { mount, render } from "enzyme";

import Footnote from "../Footnote";

const defaultProps = {
  copy: "en",
  number: 3,
  content:
    "Text for content",
  onClose: () => {},
};

const Wrapper = (props) => {
  const refOne = useRef(null);
  const refTwo = useRef(null);
  return (
    <div>
      <span id="title">Terms and conditions may apply</span>
      <button id="one" type="button" ref={refOne}>
        1
      </button>
      <button id="two" type="button" ref={refTwo}>
        2
      </button>
      <Footnote {...props} />
    </div>
  );
};

describe("Footnote", () => {
  const doRenderWrapper = (props = {}) =>
    render(<Wrapper {...defaultProps} {...props} />);
  const doMountWrapper = (props = {}, options = {}) =>
    mount(<Wrapper {...defaultProps} {...props} />, options);

  it("renders closed", () => {
    const footnote = doRenderWrapper();
    expect(footnote).toMatchSnapshot();
  });

  it("renders opened", () => {
    const footnote = doRenderWrapper({ isOpen: true });
    expect(footnote).toMatchSnapshot();
  });

  describe("onClose", () => {
    it("calls onClose when ESCAPE is pressed", () => {
      const events = {};
      window.addEventListener = jest.fn((event, cb) => {
        events[event] = cb;
      });

      const onClose = jest.fn();
      doMountWrapper({ isOpen: true, onClose });
      events.keydown({ type: "keydown", key: "Escape" });
      expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose when clicking outside the Footnote", () => {
      const events = {};
      window.addEventListener = jest.fn((event, cb) => {
        events[event] = cb;
      });

      const onClose = jest.fn();
      const footnote = doMountWrapper({ isOpen: true, onClose });
      events.click({
        type: "click",
        target: footnote.find("span#title").getDOMNode(),
      });
      expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose when clicking the close button", () => {
      const events = {};
      window.addEventListener = jest.fn((event, cb) => {
        events[event] = cb;
      });

      const onClose = jest.fn();
      const footnote = doMountWrapper({ isOpen: true, onClose });

      footnote.find("Footnote").find("button").simulate("click");

      expect(onClose).toHaveBeenCalled();
    });
  });
});
