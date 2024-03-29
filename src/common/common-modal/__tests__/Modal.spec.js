import React from "react";
import { mount, shallow } from "enzyme";

import Modal from "../Modal";
import Heading from "../../../core/core-heading/Heading";
import Box from "../../../core/core-box/Box";
import Button from "../../../core/core-button/Button";

describe("Modal", () => {
  const doMount = (props = {}) =>
    mount(
      <Modal
        isOpen={true}
        heading="A heading"
        bodyText="Are you sure?"
        confirmCTAText="I am sure"
        focusElementAfterClose={{}}
        onConfirm={() => {}}
        onClose={() => {}}
        {...props}
      />
    );

  it("renders", () => {
    const modal = doMount();

    expect(modal).toMatchSnapshot();
  });

  it("does other things", () => {
    const modal = doMount();

    expect(modal).toExist();
  });

  it("passes additional attributes to the element", () => {
    const modal = doMount({ id: "the-id", "data-some-attr": "some value" });

    expect(modal).toHaveProp("id", "the-id");
    expect(modal).toHaveProp("data-some-attr", "some value");
  });

  it('should set default width(570px) when "width" props not provided', () => {
    const modal = doMount();
    expect(modal).toHaveProp("width", 570);
  });

  it('should set width based on "width" size provided', () => {
    const modal = doMount({ width: 630 });
    expect(modal).toHaveProp("width", 630);
  });

  it("does not allow custom CSS", () => {
    const modal = doMount({
      className: "my-custom-class",
      style: { color: "hotpink" },
    }).find('[data-testid="tds-modal-overlay"]');

    expect(modal).not.toHaveProp("className", "my-custom-class");
    expect(modal).not.toHaveProp("style");
  });

  it("mount with custom Component", () => {
    const heading = <Heading level="h4">test heading</Heading>;
    const bodyText = <Box>hello World</Box>;
    const doMountWithCustomContent = (props = {}) =>
      mount(
        <Modal
          isOpen={true}
          heading={heading}
          bodyText={bodyText}
          confirmCTAText="I am sure"
          focusElementAfterClose={{}}
          onConfirm={() => {}}
          onClose={() => {}}
          {...props}
        />
      );

    const modalWithCustomContent = doMountWithCustomContent();

    expect(modalWithCustomContent.contains(heading)).toEqual(true);
    expect(modalWithCustomContent.contains(bodyText)).toEqual(true);
  });

  it("should not show cta when confirmCTAText is empty", () => {
    const doShallow = (props = {}) =>
      shallow(
        <Modal
          isOpen={true}
          heading="A heading"
          bodyText="Text"
          confirmCTAText=""
          focusElementAfterClose={{}}
          onConfirm={() => {}}
          onClose={() => {}}
          {...props}
        />
      );

    const modalWithNoCta = doShallow();

    expect(modalWithNoCta.find(Button)).toHaveLength(0);
  });

  //   Check if confirm and cancel buttons appear when using Dialogue Modal
  // Check if confirm and close buttons appear when using Content Modal
  // Ensure heading appears using level-3 styles (using level={h3} tag="div" props)
});
