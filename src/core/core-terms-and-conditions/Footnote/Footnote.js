import React, { useRef, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import styled, { createGlobalStyle } from "styled-components";

import StyledClickable from "../StyledClickable";
import List from "./FootnoteList";
import CloseIcon from "./svg/Close";
import copyDictionary from "./footnoteText";
import renderContent from "../renderContent";
import Box from "../../core-box/Box";
import FlexGrid from "../../core-flex-grid/FlexGrid";
import HairlineDivider from "../../core-hairline-divider/HairlineDivider";
import Text from "../../core-text/Text";
import { getCopy, safeRest } from "../../../util-helpers";
import { withFocusTrap } from "../../../shared-hocs";
import { media } from "../../core-responsive";
import { colorGreyAthens } from "../../core-colours/colours";
import Heading from "../../core-heading/Heading";

const GlobalBodyScrollLock = createGlobalStyle({
  "html, body": media.until("md").css({ overflow: "hidden" }),
});

const StyledFootnote = styled.div(
  {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100%",
    backgroundColor: colorGreyAthens,
    display: "block",
    boxShadow: "0 0 16px 0 rgba(0, 0, 0, 0.1)",
    transform: "translateY(100%)",
    transition: "transform 500ms ease-out",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none",
    },
    zIndex: 99999,
    ...media.from("md").css({
      top: "auto",
      bottom: 0,
      height: "auto",
      maxHeight: "50vh",
    }),
  },
  ({ isVisible }) => ({
    visibility: isVisible ? "visible" : "hidden",
  }),
  ({ isOpen }) => {
    if (isOpen) {
      return {
        transform: "translateY(0)",
      };
    }
    return {};
  }
);

const StyledFootnoteHeader = styled.div({
  position: "relative",
  width: "100%",
});

const StyledHeader = styled(Box)({
  alignItems: "center",
});

const StyledFootnoteBody = styled.div(
  {
    overflow: "auto",
    "-webkit-overflow-scrolling": "touch",
    transition: "height 300ms ease-out, opacity 200ms ease-out",
    transform: "translateZ(0)",
    "@media (prefers-reduced-motion: reduce)": {
      transition: "height 1ms ease-out, opacity 1ms ease-out",
    },
    backgroundColor: colorGreyAthens,
  },
  ({ headerHeight }) => ({
    maxHeight: `calc(100vh - ${headerHeight}px)`,
    ...media.from("md").css({
      maxHeight: `calc(50vh - ${headerHeight}px)`,
    }),
  }),
  ({ bodyHeight, isTextVisible }) => ({
    height: bodyHeight,
    opacity: isTextVisible ? 1 : 0,
  })
);

const StyledListContainer = styled.div({
  paddingTop: "1.5rem",
  paddingBottom: "2rem",
  ...media.from("md").css({
    paddingTop: "0rem",
    paddingBottom: "3rem",
  }),
});

const FocusTrap = withFocusTrap("div");

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  if (ref.current) {
    return ref.current;
  }
  return {};
};

const Footnote = (props) => {
  const { copy, number, content, onClose, isOpen, ...rest } = props;
  const footnoteRef = useRef(null);
  const headerRef = useRef(null);
  const bodyRef = useRef(null);
  const listRef = useRef(null);
  const headingRef = useRef(null);
  const [data, setData] = useState({ content: null, number: null });
  const [headerHeight, setHeaderHeight] = useState("auto");
  const [bodyHeight, setBodyHeight] = useState("auto");
  const [isVisible, setIsVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(true);

  const prevProps = usePrevious(props);

  const closeFootnote = useCallback(
    (e, options) => {
      onClose(e, options);
    },
    [onClose]
  );

  // listen for ESCAPE, close button clicks, and clicks outside of the Footnote. Call onClose.
  const handleClose = useCallback(
    (e) => {
      if (e.type === "keydown") {
        const key = e.keyCode || e.key;
        if (key === "Escape" || key === 27) {
          closeFootnote(e, { returnFocus: true });
        }
      } else if (
        e.type === "click" &&
        footnoteRef &&
        e.target &&
        !footnoteRef.current.contains(e.target) &&
        e.target.getAttribute("data-tds-id") !== "footnote-link"
      ) {
        closeFootnote(e, { returnFocus: false });
      } else if (
        e.type === "touchstart" &&
        footnoteRef &&
        e.touches[0].target &&
        !footnoteRef.current.contains(e.touches[0].target) &&
        e.touches[0].target.getAttribute("data-tds-id") !== "footnote-link"
      ) {
        closeFootnote(e, { returnFocus: false });
      }
    },
    [closeFootnote]
  );

  const saveCurrentHeight = () => {
    const oldHeight = listRef.current.offsetHeight;
    setBodyHeight(oldHeight);
  };

  const focusHeading = () => {
    if (
      content !== null &&
      isVisible &&
      headingRef &&
      headingRef.current !== null
    ) {
      headingRef.current.focus();
    }
  };

  const handleStyledFootnoteTransitionEnd = (e) => {
    if (e.propertyName === "transform" && !isOpen) {
      setIsVisible(false);
    } else {
      focusHeading();
    }
  };

  const handleTransitionEnd = (e) => {
    e.persist();
    if (e.propertyName === "opacity" && !isTextVisible) {
      setData({ content, number });
      if (bodyHeight !== listRef.current.offsetHeight) {
        // set new height
        setBodyHeight(listRef.current.offsetHeight);
      } else {
        setIsTextVisible(true);
      }
    } else {
      setBodyHeight(listRef.current.offsetHeight);
    }

    if (e.propertyName === "height" && !isTextVisible) {
      setIsTextVisible(true);
    }
  };

  const resetFootnote = () => {
    // reset footnote state if closed
    if (!isOpen) {
      setBodyHeight("auto");
      setIsTextVisible(true);
    }
  };

  // set height of header on mount
  useEffect(() => {
    setHeaderHeight(headerRef.current.offsetHeight);
  }, []);

  const preventDefault = (e) => {
    if (!bodyRef.current.contains(e.touches[0].target)) {
      e.preventDefault();
    }
  };

  // add listeners for mouse clicks outside of Footnote and for ESCAPE key presses
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      window.addEventListener("click", handleClose);
      window.addEventListener("keydown", handleClose);
      window.addEventListener("touchstart", handleClose);
      window.addEventListener("touchmove", preventDefault, { passive: false });
    }
    return () => {
      if (isOpen) {
        window.removeEventListener("click", handleClose);
        window.removeEventListener("keydown", handleClose);
        window.removeEventListener("touchstart", handleClose);
        window.removeEventListener("touchmove", preventDefault);
      }
    };
  }, [handleClose, isOpen]);

  // set data if opening a new footnote
  useEffect(() => {
    if (isOpen && !prevProps.isOpen) {
      setData({ content, number });
    }
  }, [isOpen, prevProps.isOpen, content, number]);

  useEffect(() => {
    if (isOpen && prevProps.isOpen && number !== prevProps.number) {
      saveCurrentHeight();
      setIsTextVisible(false);
    }
  }, [number, isOpen, prevProps.isOpen, prevProps.number]);
  // reset footnote on close
  useEffect(resetFootnote, [isOpen]);

  return (
    <div {...safeRest(rest)}>
      {isOpen && <GlobalBodyScrollLock />}
      <StyledFootnote
        ref={footnoteRef}
        isOpen={isOpen}
        isVisible={isVisible}
        onTransitionEnd={handleStyledFootnoteTransitionEnd}
      >
        <FocusTrap autofocus={false}>
          <StyledFootnoteHeader ref={headerRef}>
            <div
              css={{
                display: "none",
                ...media.from("md").css({ display: "block" }),
              }}
            >
              <HairlineDivider />
            </div>
            <Box vertical={4}>
              <FlexGrid>
                <FlexGrid.Row>
                  <FlexGrid.Col xs={12}>
                    <StyledHeader between="space-between" inline>
                      <Heading
                        level="h4"
                        tag="h2"
                        tabIndex={-1}
                        ref={headingRef}
                      >
                        {getCopy(copyDictionary, copy).heading}
                      </Heading>
                      <StyledClickable
                        type="button"
                        onClick={(e) => {
                          closeFootnote(e, { returnFocus: true });
                        }}
                        aria-label={getCopy(copyDictionary, copy).close}
                      >
                        <CloseIcon />
                      </StyledClickable>
                    </StyledHeader>
                  </FlexGrid.Col>
                </FlexGrid.Row>
              </FlexGrid>
            </Box>
            <div
              css={{
                display: "none",
                ...media.until("md").css({ display: "block" }),
              }}
            >
              <HairlineDivider />
            </div>
          </StyledFootnoteHeader>
          <StyledFootnoteBody
            ref={bodyRef}
            bodyHeight={bodyHeight}
            headerHeight={headerHeight}
            isTextVisible={isTextVisible}
            onTransitionEnd={handleTransitionEnd}
          >
            {data.number && data.content && (
              <StyledListContainer ref={listRef}>
                <FlexGrid>
                  <FlexGrid.Row>
                    <FlexGrid.Col xs={12} md={11}>
                      <List start={data.number} type="indexed">
                        <List.Item>
                          <Text>{renderContent(data.content)}</Text>
                        </List.Item>
                      </List>
                    </FlexGrid.Col>
                  </FlexGrid.Row>
                </FlexGrid>
              </StyledListContainer>
            )}
          </StyledFootnoteBody>
        </FocusTrap>
      </StyledFootnote>
    </div>
  );
};

const copyShape = PropTypes.shape({
  heading: PropTypes.string.isRequired,
  close: PropTypes.string.isRequired,
});

Footnote.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), copyShape])
    .isRequired,
  number: PropTypes.number,
  content: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
};

Footnote.defaultProps = {
  isOpen: false,
  number: undefined,
  content: undefined,
};

export default Footnote;
