import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { componentWithName, or } from "../../util-prop-types";
import { safeRest } from "../../util-helpers";

const StyledA11yContent = styled.span({
  position: "absolute",
  height: "1px",
  width: "1px",
  overflow: "hidden",
  clip: "rect(1px, 1px, 1px, 1px)",
});

const A11yContent = ({ children, ...rest }) => {
  return <StyledA11yContent {...safeRest(rest)}>{children}</StyledA11yContent>;
};

A11yContent.propTypes = {
  children: or([PropTypes.string, componentWithName("Heading")]).isRequired,
};
A11yContent.defaultProps = {};

export default A11yContent;
