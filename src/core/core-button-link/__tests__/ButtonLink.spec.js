import React from "react";
import { mount, shallow, render } from "enzyme";

import ButtonLink from "../ButtonLink";
import { warn } from "../../../utils/warn";
import A11yContent from "../../core-a11y-content/A11yContent";

jest.mock("../../../utils/warn");

describe("ButtonLink", () => {
  const doMount = (overrides = {}) => {
    const link = mount(<ButtonLink {...overrides}>Go home</ButtonLink>);

    return link.find("a");
  };

  const doShallow = (overrides = {}) => {
    const link = shallow(<ButtonLink {...overrides}>Go home</ButtonLink>);

    return link;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders", () => {
    const link = render(<ButtonLink>Go home</ButtonLink>);

    expect(link).toMatchSnapshot();
  });

  it("is an anchor HTML element when using the href attribute", () => {
    const link = doMount({ href: "http://nds_core.com" });

    expect(link).toHaveDisplayName("a");
    expect(link).toHaveProp("href", "http://nds_core.com");
  });

  it("renders a react router link element when passed as a prop", () => {
    const MyLink = () => <span />;
    const link = mount(
      <ButtonLink reactRouterLinkComponent={MyLink}>The link test</ButtonLink>
    );

    expect(link.find(MyLink)).toExist();
  });

  it("must use `reactRouterLinkComponent` and `to` props together", () => {
    const MyLink = () => <span />;
    doShallow({ reactRouterLinkComponent: MyLink });

    expect(warn).toHaveBeenCalled();

    jest.clearAllMocks();

    const link = doShallow({ to: "/about" });

    expect(link).toHaveProp("to");
    expect(warn).toHaveBeenCalled();
  });

  it("can be presented as one of the allowed variants", () => {
    const link = render(<ButtonLink variant="secondary">Go home</ButtonLink>);

    expect(link).toMatchSnapshot();
  });

  it("can be presented as one of the allowed variants", () => {
    const link = render(
      <ButtonLink variant="standard" rank="main">
        Go home
      </ButtonLink>
    );

    expect(link).toMatchSnapshot();
  });

  it("can be presented as one of the allowed fullwidth", () => {
    const link = render(<ButtonLink fullWidth>Go home</ButtonLink>);

    expect(link).toMatchSnapshot();
  });

  it("passes additional attributes to link element", () => {
    const link = doShallow({ id: "the-link", tabIndex: 1 });

    expect(link).toHaveProp("id", "the-link");
    expect(link).toHaveProp("tabIndex", 1);
  });

  describe("A11yContent", () => {
    it("connects to ButtonLink", () => {
      const link = shallow(
        <ButtonLink>
          Go home
          <A11yContent>testing</A11yContent>
        </ButtonLink>
      );

      expect(link).toContainReact(<A11yContent>testing</A11yContent>);
    });
  });

  it("does not allow custom CSS", () => {
    const link = doShallow({
      className: "my-custom-class",
      style: { color: "hotpink" },
    });

    expect(link).not.toHaveProp("className", "my-custom-class");
    expect(link).not.toHaveProp("style");
  });
});
