import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import styled, { ThemeProvider } from "styled-components";
import A11yContent from "../core-a11y-content/A11yContent";
import { colorGreyGainsboro } from "../core-colours/colours";
import { safeRest } from "../../util-helpers";
import { componentWithName } from "../../util-prop-types";
import animations from "./shared/animations";
import SharedStyledInteractiveIconButton from "./shared/StyledInteractiveIconButton";
import SharedStyledInteractiveIconHover from "./shared/StyledInteractiveIconHover";
import { warn } from "../../utils/warn";

export const StyledIconButton = styled(SharedStyledInteractiveIconButton)(
  animations.scale,
  {
    "&:hover > svg": animations.reduceMotion,
  }
);

const getTheme = (variant) => {
  if (variant === "alternative") {
    return {
      hoverBackgroundColor: "#D8CBE5",
    };
  }
  if (variant === "inverted") {
    return {
      hoverBackgroundColor: "transparent",
    };
  }
  return {
    hoverBackgroundColor: colorGreyGainsboro,
  };
};

const IconButton = forwardRef(
  ({ a11yText, variant, onClick, tag, icon: Icon, ...rest }, ref) => {
    let color;
    if (variant === "alternative") {
      color = "colorNemetonPurple";
    } else if (variant === "inverted") {
      color = "white";
    } else {
      color = "greyShark";
    }

    if (
      Icon.name !== "Add" &&
      Icon.name !== "Close" &&
      Icon.name !== "Subtract" &&
      Icon.name !== "PlayVideo"
    ) {
      warn(
        "IconButton",
        "IconButton is meant to be used with the Add, Close, Subtract, and PlayVideo icons for their universally-recognizable appearance. Other icons should be accompanied with text and not as a part of IconButton."
      );
    }

    return (
      <ThemeProvider theme={getTheme(variant)}>
        <StyledIconButton
          {...safeRest(rest)}
          variant={variant}
          onClick={onClick}
          as={tag}
          ref={ref}
        >
          <A11yContent>{a11yText}</A11yContent>
          <SharedStyledInteractiveIconHover />
          <Icon color={color} />
        </StyledIconButton>
      </ThemeProvider>
    );
  }
);

IconButton.displayName = "IconButton";

IconButton.propTypes = {
  a11yText: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["default", "alternative", "inverted"]),
  onClick: PropTypes.func,
  tag: PropTypes.oneOf(["button", "a"]),
  icon: PropTypes.oneOfType([
    componentWithName("Add"),
    componentWithName("Close"),
    componentWithName("PlayVideo"),
    componentWithName("Subtract"),
  ]).isRequired,
};

IconButton.defaultProps = {
  variant: "default",
  onClick: undefined,
  tag: "button",
};

export default IconButton;
