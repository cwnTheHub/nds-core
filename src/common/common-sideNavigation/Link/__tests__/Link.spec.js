import React from "react";
import { shallow, mount } from "enzyme";

import Link from "../Link";
import { warn } from "../../../../utils/warn";

jest.mock("../../../../utils/warn");

describe("SideNavigation.Link", () => {
  const children = <Link href="#">Home</Link>;
  const doMount = () => mount(children);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders", () => {
    const link = doMount();
    expect(link).toMatchSnapshot();
  });

  it("renders with active styles", () => {
    const link = mount(
      <Link href="#" active>
        Home
      </Link>
    );

    expect(link).toMatchSnapshot();
  });

  it("must use `reactRouterLinkComponent` and `to` props together", () => {
    const doShallowLink = (overrides = {}) =>
      shallow(<Link {...overrides}>Go home</Link>);
    const MyLink = () => <span />;
    doShallowLink({ reactRouterLinkComponent: MyLink });

    expect(warn).toHaveBeenCalled();

    jest.clearAllMocks();

    const link = doShallowLink({ to: "/about" });

    expect(link).toHaveProp("to");
    expect(warn).toHaveBeenCalled();
  });
});
