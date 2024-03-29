import React from "react";
import { shallow, mount } from "enzyme";
import IconButton, { StyledIconButton } from "../IconButton";
import Link from "../../core-link/Link";
import { Add, Edit } from "../svgs";
import Paragraph from "../../core-paragraph/Paragraph";

describe("InteractiveIcon", () => {
  const doShallow = (props = {}) =>
    shallow(
      <IconButton icon={Add} a11yText="This is an interactive icon" {...props}>
        <svg />
      </IconButton>
    );

  it("renders", () => {
    const iconButton = mount(
      <IconButton icon={Add} a11yText="This is an interactive icon">
        <svg />
      </IconButton>
    );

    expect(iconButton).toMatchSnapshot();
  });

  it("renders Dependent icon with Link", () => {
    const dependentIcon = mount(
      <Link href="#" icon={Edit} iconPosition="left">
        Edit
      </Link>
    );

    expect(dependentIcon).toMatchSnapshot();
  });

  it("does other things", () => {
    const iconButton = doShallow();

    expect(iconButton).toBeTruthy();
  });

  it("passes additional attributes to the element", () => {
    const iconButton = doShallow({
      id: "the-id",
      "data-some-attr": "some value",
    }).find(StyledIconButton);

    expect(iconButton.props().id).toEqual("the-id");
    expect(iconButton.props()["data-some-attr"]).toEqual("some value");
  });

  it("inherits invert prop from Link", () => {
    const invertedLink = mount(
      <Link href="#" icon={Edit} iconPosition="left" invert>
        Edit
      </Link>
    );

    expect(invertedLink.find(Edit).props().color).toEqual("white");
  });

  it("inherits size prop from Paragraph", () => {
    const largeParagraph = mount(
      <Paragraph size="large">
        <Link href="#" icon={Edit} iconPosition="left" invert>
          Edit
        </Link>
      </Paragraph>
    );

    const mediumParagraph = mount(
      <Paragraph size="medium">
        <Link href="#" icon={Edit} iconPosition="left" invert>
          Edit
        </Link>
      </Paragraph>
    );

    const smallParagraph = mount(
      <Paragraph size="small">
        <Link href="#" icon={Edit} iconPosition="left" invert>
          Edit
        </Link>
      </Paragraph>
    );

    expect(largeParagraph.props().size).toEqual("large");
    expect(mediumParagraph.props().size).toEqual("medium");
    expect(smallParagraph.props().size).toEqual("small");
  });

  it("does not allow custom CSS", () => {
    const iconButton = doShallow({
      className: "my-custom-class",
      style: { color: "hotpink" },
    });

    expect(iconButton.props().className).not.toEqual("my-custom-class");
    expect(iconButton.props().style).toBe(undefined);
  });
});
