import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  small,
  medium,
  large,
  smallFont,
  mediumFont,
  largeFont,
} from "../../../shared-typography/typography";
import {
  colorNemetonPurple,
  colorPrimary,
  colorCardinal,
} from "../../core-colours/colours";
import { safeRest } from "../../../util-helpers";

const StyledUnorderedItem = styled.li(({ iconStyle, size }) => ({
  position: "relative",
  lineHeight: 1,
  ...(size === "small" && { ...small, ...smallFont }),
  ...(size === "medium" && { ...medium, ...mediumFont }),
  ...(size === "large" && { ...large, ...largeFont }),

  "&::before": {
    display: "block",
    position: "absolute",
    left: "-2rem",
    fontFamily: "Font Awesome 5 Free",
    ...(size === "small" && { lineHeight: 1.25 }),
    ...(size === "medium" && { lineHeight: 1.6 }),
    ...(size === "large" && { lineHeight: 2.1 }),

    ...(iconStyle === "circle" && {
      content: "",
      backgroundImage:
        "'url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjNGIyODZkIiAvPjwvc3ZnPg==)'",
      color: colorNemetonPurple,
      backgroundRepeat: "no-repeat",
      backgroundSize: "100% 100%",

      ...(size === "small" && {
        width: "0.25rem",
        height: "0.25rem",
        top: "0.5rem",
      }),

      ...(size === "medium" && {
        width: "0.32rem",
        height: "0.32rem",
        top: "0.65rem",
      }),

      ...(size === "large" && {
        width: "0.38rem",
        height: "0.38rem",
        top: "0.87rem",
      }),
    }),

    ...(iconStyle === "checkmark" && {
      content: "'\f101'",
      fontSize: "1rem",
      width: "0.75rem",
      color: colorPrimary,
    }),

    ...(iconStyle === "x" && {
      content: "'\f104'",
      fontSize: "1rem",
      width: "0.75rem",
      color: colorCardinal,

      ...(size === "small" && {
        lineHeight: 1.32,
      }),
    }),
  },
}));

const UnorderedItem = ({ listStyle, itemStyle, size, children, ...rest }) => (
  <StyledUnorderedItem
    {...safeRest(rest)}
    iconStyle={itemStyle || listStyle}
    size={size}
  >
    {children}
  </StyledUnorderedItem>
);

UnorderedItem.propTypes = {
  listStyle: PropTypes.oneOf(["circle", "checkmark", "x"]),
  itemStyle: PropTypes.oneOf(["circle", "checkmark", "x"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  children: PropTypes.node.isRequired,
};

UnorderedItem.defaultProps = {
  listStyle: "circle",
  itemStyle: undefined,
  size: "medium",
};

UnorderedItem.displayName = "UnorderedList.Item";

export default UnorderedItem;
