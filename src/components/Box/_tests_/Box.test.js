import React from "react";
import { render, cleanup } from "@testing-library/react";
import Box from "../Box";

describe("Simple Box", () => {
  afterEach(cleanup);

  const defaultProps = {
    children: <p data-testid="content">this is a child</p>,
  };

  const setup = () => {
    const utils = render(<Box {...defaultProps} />);
    return {
      ...utils,
    };
  };

  it("renders the box element ", () => {
    const { getByTestId } = setup();
    const Box = getByTestId("box-container");
    expect(Box).toBeInTheDocument();
  });
  it("renders the children", () => {
    const { getByTestId } = setup();
    const child = getByTestId("content");
    expect(child).toBeInTheDocument();
  });


});
