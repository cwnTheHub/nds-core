// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "jest-enzyme";
import Enzyme from "../config/jest/setupEnzyme";
import util from "util";
Object.defineProperty(global, "TextEncoder", {
  value: util.TextEncoder,
});
