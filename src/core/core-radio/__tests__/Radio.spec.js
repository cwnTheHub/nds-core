import React from "react";
import { mount, render } from "enzyme";

import Radio from "../Radio";
import ColoredTextProvider from "../../../utils/components/ColoredTextProvider/ColoredTextProvider";
import InputFeedback from "../../core-input-feedback/InputFeedback";
import Text from "../../core-text/Text";

describe("Radio", () => {
  const defaultProps = {
    label: "The radio",
    name: "radio_group",
    value: "the-value",
  };
  const doMount = (overrides = {}) => {
    const radio = mount(<Radio {...defaultProps} {...overrides} />);

    const findRadioElement = () =>
      radio.find('[data-testid="hidden-input"]').find("input");

    return {
      radio,
      label: radio.find("label"),
      description: () => radio.find('[data-testid="description"]'),
      findRadioElement,
      findFakeRadio: () => radio.find('[data-testid="fake-input"]'),
      findFakeInnerRadio: () => radio.find('[data-testid="fake-inner-radio"]'),
      findColoredLabel: () => radio.find(ColoredTextProvider),
      findErrorMessage: () => radio.find(InputFeedback),
      check: () =>
        findRadioElement().simulate("change", { target: { checked: true } }),
      focus: (focusEvent = {}) =>
        findRadioElement().simulate("focus", focusEvent),
      blur: (blurEvent = {}) => findRadioElement().simulate("blur", blurEvent),
    };
  };

  it("renders", () => {
    const radio = render(
      <Radio label="A label" name="the-group" value="the-value" />
    );

    expect(radio).toMatchSnapshot();
  });

  it("allows numbers as value", () => {
    const radio = render(<Radio label="A label" name="the-group" value={1} />);

    expect(radio).toMatchSnapshot();
  });

  it("must have a label", () => {
    const { label } = doMount({ label: "Some label" });
    expect(label).toMatchSnapshot();
  });

  it("will display a description if defined", () => {
    const { label } = doMount({ description: "This is a description." });

    expect(label).toContainReact(
      <Text size="small">This is a description.</Text>
    );
  });

  it("must have a name and a value", () => {
    const { findRadioElement } = doMount({
      name: "some-radio-group",
      value: "some-value",
    });

    expect(findRadioElement()).toHaveProp("name", "some-radio-group");
    expect(findRadioElement()).toHaveProp("value", "some-value");
  });

  it("has a fake radio", () => {
    const { findFakeRadio } = doMount();

    expect(findFakeRadio()).toMatchSnapshot();
  });

  describe("connecting the label to the radio", () => {
    it("connects the label to the radio", () => {
      const { label, findRadioElement } = doMount();

      expect(label.prop("htmlFor")).toEqual(findRadioElement().prop("id"));
    });

    it("uses the id when provided", () => {
      const { label, findRadioElement } = doMount({
        id: "the-id",
        name: "the-radio-group",
        value: "the-value",
      });

      expect(label).toHaveProp("htmlFor", "the-id");
      expect(findRadioElement()).toHaveProp("id", "the-id");
    });

    it("uses the name and the value when no id is provided", () => {
      const { label, findRadioElement } = doMount({
        name: "the-radio-group",
        value: "the-value",
      });

      expect(label).toHaveProp("htmlFor", "the-radio-group_the-value");
      expect(findRadioElement()).toHaveProp("id", "the-radio-group_the-value");
    });
  });

  describe("interactivity", () => {
    it("notifies when it is checked", () => {
      const onChangeMock = jest.fn();
      const { check } = doMount({ onChange: onChangeMock });

      check();
      expect(onChangeMock).toHaveBeenCalledWith(
        expect.objectContaining({ target: { checked: true } })
      );
    });

    it("can receive a new value from a parent component", () => {
      const { radio, findRadioElement } = doMount({
        checked: false,
        readOnly: true,
      });

      radio.setProps({ checked: true });

      expect(findRadioElement()).toHaveProp("checked", true);
    });
  });

  describe("focusing", () => {
    it("can be focused and unfocused", () => {
      const { findFakeRadio, focus, blur } = doMount();

      focus();
      expect(findFakeRadio()).toMatchSnapshot();

      blur();
      expect(findFakeRadio()).toMatchSnapshot();
    });

    it("will notify when focus is gained", () => {
      const onFocusMock = jest.fn();
      const event = { target: { value: "the value" } };

      const { focus } = doMount({ onFocus: onFocusMock });
      focus(event);

      expect(onFocusMock).toHaveBeenCalledWith(expect.objectContaining(event));
    });

    it("will notify when focus is lost", () => {
      const onBlurMock = jest.fn();
      const event = { target: { value: "the value" } };

      const { blur } = doMount({ onBlur: onBlurMock });
      blur(event);

      expect(onBlurMock).toHaveBeenCalledWith(expect.objectContaining(event));
    });
  });

  describe("error", () => {
    it("can have an error feedback state", () => {
      const { findFakeRadio, findColoredLabel } = doMount({
        label: "Some error",
        feedback: "error",
      });

      expect(findColoredLabel()).toMatchSnapshot();
      expect(findFakeRadio()).toMatchSnapshot();
    });

    it("does not appear as an error when it is checked", () => {
      const { findFakeRadio, findColoredLabel, check } = doMount({
        label: "Some error",
        feedback: "error",
        checked: false,
        readOnly: true,
      });

      check();

      expect(findColoredLabel()).toMatchSnapshot();
      expect(findFakeRadio()).toMatchSnapshot();
    });
  });

  describe("disabled", () => {
    it("can be disabled", () => {
      const { findFakeRadio, findRadioElement, findColoredLabel } = doMount({
        label: "A label",
        disabled: true,
      });

      expect(findColoredLabel()).toMatchSnapshot();
      expect(findRadioElement()).toHaveProp("disabled", true);
      expect(findFakeRadio()).toMatchSnapshot();
    });

    it("can be disabled and checked", () => {
      const {
        findFakeRadio,
        findFakeInnerRadio,
        findRadioElement,
        findColoredLabel,
      } = doMount({
        label: "A label",
        disabled: true,
        checked: true,
        readOnly: true,
      });

      expect(findColoredLabel()).toMatchSnapshot();
      expect(findRadioElement()).toHaveProp("disabled", true);
      expect(findFakeRadio()).toMatchSnapshot();
      expect(findFakeInnerRadio()).toMatchSnapshot();
    });
  });

  describe("accessibility", () => {
    it("marks the checkbox as invalid when in the error feedback state", () => {
      let findRadioElement = doMount().findRadioElement;
      expect(findRadioElement()).toHaveProp("aria-invalid", false);

      findRadioElement = doMount({ feedback: "error" }).findRadioElement;
      expect(findRadioElement()).toHaveProp("aria-invalid", true);
    });

    it("does not attach aria-describedby to the checkbox when no error is present", () => {
      const { findRadioElement } = doMount({ error: undefined });

      expect(findRadioElement()).toHaveProp("aria-describedby", undefined);
    });

    it("connects the error message to the checkbox for screen readers", () => {
      const { findRadioElement } = doMount({
        id: "some-field-id",
        feedback: "error",
      });

      expect(findRadioElement()).toHaveProp(
        "aria-describedby",
        "some-field-id_error-message"
      );
    });
  });

  it("passes additional attributes to the radio", () => {
    const { findRadioElement } = doMount({
      disabled: true,
      "data-some-attr": "some value",
    });
    expect(findRadioElement()).toHaveProp("disabled", true);
    expect(findRadioElement()).toHaveProp("data-some-attr", "some value");
  });

  it("does not allow custom CSS", () => {
    const { findRadioElement } = doMount({
      className: "my-custom-class",
      style: { color: "hotpink" },
    });

    expect(findRadioElement()).not.toHaveProp("className", "my-custom-class");
    expect(findRadioElement()).not.toHaveProp("style");
  });
});
