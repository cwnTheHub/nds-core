import React from "react";
import TextButton from "../../core/core-text-button/TextButton";

export default {
  title: "Forms/TextButton",
  component: TextButton,
};

const Template = (args) => {
  return <TextButton onClick={args.onClick}>Click me</TextButton>;
};

export const MinimalUsage = Template.bind({});
MinimalUsage.args = {
  onClick: () =>
    alert(
      "This is where you could launch a modal, make an api call to delete or update something, etc."
    ),
};