import React from "react";
import styled from "styled-components";
import { borders, spacing } from "../../shared-styles";
import { safeRest } from "../../util-helpers";


const StyledDimpleDivider = styled.hr(spacing.noSpacing, borders.none, {
  height: "32px",
  backgroundImage:
    "radial-gradient(ellipse at top, rgba(150, 150, 150, 0.1) 0%, rgba(0, 0, 0, 0) 70%)",
});

const DimpleDivider = ({ ...rest }) => (
  <StyledDimpleDivider {...safeRest(rest)} />
);

export default DimpleDivider;
