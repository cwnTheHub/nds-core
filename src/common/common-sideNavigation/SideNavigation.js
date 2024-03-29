import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { safeRest } from "../../util-helpers";
import { colorGainsboro } from "../../core/core-colours/colours";
import Box from "../../core/core-box/Box";
import Text from "../../core/core-text/Text";

import Link from "./Link/Link";
import SubMenu from "./SubMenu/SubMenu";

const DivContainer = styled.div({
  position: "relative",
  height: "100%",
});

const topPosition = {
  position: "relative",
  maxWidth: "inherit",
  width: "100%",
  overflowY: "auto",
};

const fixedPosition = {
  position: "fixed",
  maxWidth: "inherit",
  top: "0px",
  width: "inherit",
  clear: "both",
};

const bottomPosition = {
  position: "absolute",
  bottom: "0px",
};

const fixedOverflow = {
  overflowY: "auto",
  bottom: "0px",
};

const NavContainer = styled.div((props) => ({
  ...(props.variant === "top" && topPosition),
  ...(props.variant === "bottom" && bottomPosition),
  ...(props.variant === "fixed" && fixedPosition),
  ...(props.variant === "fixedOverflow" && {
    ...fixedPosition,
    ...fixedOverflow,
  }),
}));

const StyledUl = styled.ul({
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-around",
  margin: "0",
  borderTop: `1px solid ${colorGainsboro}`,
});

const StyledLi = styled.li({
  borderBottom: `1px solid ${colorGainsboro}`,
  alignItems: "center",
  lineHeight: "0",
});

class SideNavigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: [],
      variant: "top",
      accordion: this.props.accordion,
    };
    this.adjustWidth = this.adjustWidth.bind(this);
    this.removeEventListeners = this.removeEventListeners.bind(this);
    this._sideNav = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("scroll", this.checkOffset);
    window.addEventListener("resize", this.adjustWidth);
    this.checkOffset();
    this.adjustWidth();
    this.checkActiveState();
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

  onExited = () => {
    const sideNavRect = this._sideNav.current;
    if (
      this.checkOverflow(sideNavRect) &&
      this.state.variant === "fixedOverflow"
    ) {
      this.setState({ variant: "fixed" });
    }
  };

  adjustWidth() {
    const parentWidth = this._sideNavContainer.offsetWidth;
    const sideNav = this._sideNav.current;
    sideNav.style.width = `${parentWidth}px`;
  }

  toggleSubMenu = (id) => {
    if (this.checkAccordion(id, this.state.accordion)) {
      const array = [...this.state.open];
      const index = array.indexOf(id);
      if (index !== -1) {
        array.splice(index, 1);
        this.setState({ open: array });
      }
    } else if (this.state.accordion) {
      this.setState({ open: [id] });
    } else {
      this.setState({ open: [...this.state.open, id] });
    }
  };

  removeEventListeners() {
    window.removeEventListener("scroll", this.checkOffset);
    window.removeEventListener("resize", this.adjustWidth);
  }

  checkOffset = () => {
    const sideNavRect = this._sideNav.current.getBoundingClientRect();
    const containerRect = this._sideNavContainer.getBoundingClientRect();

    if (
      (sideNavRect.top >= 0 && containerRect.top >= 0) ||
      sideNavRect.height >= containerRect.height
    ) {
      this.setState({ variant: "top" });
    } else if (
      this.checkOverflow(this._sideNav.current) &&
      sideNavRect.bottom <= containerRect.bottom &&
      sideNavRect.bottom >= 0 &&
      this.state.variant !== "bottom" &&
      sideNavRect.height < containerRect.height
    ) {
      this.setState({ variant: "fixedOverflow" });
    } else if (
      ((sideNavRect.top < 0 &&
        containerRect.top < 0 &&
        sideNavRect.bottom <= containerRect.bottom &&
        sideNavRect.bottom > 0 &&
        this.state.variant !== "bottom") ||
        (sideNavRect.top > 0 && containerRect.top <= 0)) &&
      sideNavRect.height < containerRect.height
    ) {
      this.setState({ variant: "fixed" });
    } else if (
      ((sideNavRect.bottom > containerRect.bottom || sideNavRect.bottom <= 0) &&
        sideNavRect.height <= containerRect.height &&
        this.state.variant !== "top") ||
      (sideNavRect.top < 0 &&
        containerRect.top < 0 &&
        sideNavRect.bottom <= containerRect.bottom &&
        sideNavRect.bottom < 0 &&
        this.state.variant !== "bottom")
    ) {
      this.setState({ variant: "bottom" });
    }
  };

  checkAccordion = (id) => {
    return this.state.open.some((el) => {
      return el === id;
    });
  };

  checkOverflow = (element) => {
    return element.scrollHeight >= window.innerHeight;
  };

  checkActiveState = () => {
    React.Children.map(this.props.children, (child, index) => {
      const id = `TDS-SideNavigation-${index}`;
      if (!("href" in child.props) && child.props.active) {
        this.toggleSubMenu(id);
      }
    });
  };

  render() {
    const { children, verticalSpacing, accordion, category, ...rest } =
      this.props;
    const { variant } = this.state;

    return (
      <DivContainer
        {...safeRest(rest)}
        ref={(c) => {
          this._sideNavContainer = c;
        }}
      >
        <NavContainer ref={this._sideNav} variant={variant}>
          <Box
            vertical={
              variant === "bottom" ||
              variant === "fixed" ||
              variant === "fixedOverflow"
                ? undefined
                : verticalSpacing
            }
          >
            {category && (
              <Box vertical={3} horizontal={3}>
                <Text size="large" bold>
                  {category}
                </Text>
              </Box>
            )}
            <StyledUl>
              {React.Children.map(children, (child, index) => {
                let options = {};
                const id = `TDS-SideNavigation-${index}`;
                // check if href is in props to figure out if child is SubMenu or Link
                if (!("href" in child.props)) {
                  options = {
                    handleToggleSubMenu: this.toggleSubMenu,
                    isOpen: this.checkAccordion(id),
                    id,
                    onOpen: this.checkOffset,
                    onExit: this.onExited,
                  };
                }
                return (
                  <StyledLi>{React.cloneElement(child, options)}</StyledLi>
                );
              })}
            </StyledUl>
          </Box>
        </NavContainer>
      </DivContainer>
    );
  }
}

SideNavigation.propTypes = {
  category: PropTypes.string,
  children: PropTypes.node.isRequired,
  verticalSpacing: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8]),
  accordion: PropTypes.bool,
};

SideNavigation.defaultProps = {
  verticalSpacing: undefined,
  accordion: true,
  category: undefined,
};

SideNavigation.Link = Link;
SideNavigation.SubMenu = SubMenu;

export default SideNavigation;
