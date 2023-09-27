'use strict';

var React = require('react');
var PropTypes = require('prop-types');
var styled = require('styled-components');
var find = require('array-find-es6');
var Media = require('react-media');
var ReactDOM = require('react-dom');

const componentWithName = (passedName, checkDisplayName) => {
  if (typeof passedName !== "string") {
    throw new Error("passedName must be a string");
  }
  const checkProp = (props, propName, componentName) => {
    if (typeof props[propName] === "undefined" || props[propName] === null) {
      return undefined;
    }
    if (Array.isArray(props[propName])) {
      return props[propName].map((_, index) => checkProp(props[propName], index, componentName)).find(Boolean);
    }
    const testNameInObject = () => typeof props[propName] === "object" && (!checkDisplayName && props[propName].type.name !== passedName || checkDisplayName && props[propName].type.displayName !== passedName);
    const testNameInFunction = () => typeof props[propName] === "function" && (!checkDisplayName && props[propName].name !== passedName || checkDisplayName && props[propName].displayName !== passedName);
    if (props[propName] && typeof props[propName] !== "object" && typeof props[propName] !== "function" || testNameInObject() || testNameInFunction()) {
      return new Error(`${componentName}: Component passed to \`${propName}\` prop should be ${passedName}`);
    }
    return undefined;
  };
  const checkRequired = (props, propName, componentName) => {
    if (props[propName] === undefined) {
      return new Error(`The prop \`${propName}\` is marked as required in \`${componentName}\`, but its value is ${props[propName]}.`);
    }
    return undefined;
  };
  const createValidate = isRequired => {
    if (isRequired) {
      return (props, propName, componentName) => {
        const checkForError = checkProp(props, propName, componentName);
        if (checkForError) {
          return checkForError;
        }
        return checkRequired(props, propName, componentName);
      };
    }
    return checkProp;
  };
  const validate = createValidate();
  validate.isRequired = createValidate(true);
  return validate;
};

function responsiveProps(type) {
  return PropTypes.oneOfType([type, PropTypes.shape({
    xs: type,
    sm: type,
    md: type,
    lg: type,
    xl: type
  })]);
}

const createValidator = validators => {
  const validator = (props, propName, componentName, ...rest) => {
    if (props[propName] === undefined) {
      return null;
    }
    const errors = validators.map(v => v(props, propName, componentName, ...rest)).filter(error => error);
    if (errors.length >= validators.length) {
      return new Error(`Invalid value supplied to ${propName} in ${componentName}.`);
    }
    return null;
  };
  validator.isRequired = (props, propName, componentName, ...rest) => {
    if (props[propName] === undefined) {
      return new Error(`The prop \`${propName}\` is marked as required in \`${componentName}\`, but its value is ${props[propName]}.`);
    }
    const errors = validators.map(v => v(props, propName, componentName, ...rest)).filter(error => error);
    if (errors.length === validators.length) {
      return new Error(`Invalid value ${errors} supplied to required prop \`${propName}\` in \`${componentName}\`.`);
    }
    return null;
  };
  return validator;
};
const or = validators => {
  if (!Array.isArray(validators)) {
    throw new Error("2 or more validators are required to use or");
  }
  if (validators.length < 2) {
    throw new Error("2 or more validators are required to use or");
  }
  return createValidator([PropTypes.arrayOf(createValidator(validators)), ...validators]);
};

const htmlElement = element => {
  if (typeof element !== "string") {
    throw new Error("element must be a string");
  }
  const checkProp = (props, propName, componentName) => {
    if (typeof props[propName] === "undefined" || props[propName] === null) {
      return undefined;
    }
    if (Array.isArray(props[propName])) {
      // Iterates through every child and try to find the first element that does not match the passed name
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
      return props[propName].map((_, index) => checkProp(props[propName], index, componentName)).find(Boolean);
    }
    if (typeof props[propName] === "object" && typeof props[propName].type === "string") {
      if (props[propName].type === element) {
        return undefined;
      }
      return new Error(`${componentName}: Expected \`${propName}\` to be an HTML \`<${element}>\` tag`);
    }
    return undefined;
  };
  const checkRequired = (props, propName, componentName) => {
    if (props[propName] === undefined) {
      return new Error(`The prop \`${propName}\` is marked as required in \`${componentName}\`, but its value is ${props[propName]}.`);
    }
    return undefined;
  };
  const createValidate = isRequired => {
    if (isRequired) {
      return (props, propName, componentName) => {
        const checkForError = checkProp(props, propName, componentName);
        if (checkForError) {
          return checkForError;
        }
        return checkRequired(props, propName, componentName);
      };
    }
    return checkProp;
  };
  const validate = createValidate();
  validate.isRequired = createValidate(true);
  return validate;
};

const getCopy = (dictionary, copy) => {
  if (typeof copy === "undefined" || copy === null) {
    return {};
  }
  if (typeof copy === "string") {
    return dictionary[copy];
  }
  return copy;
};

let idCounter = 0;
const uniqueId = prefix => {
  const id = ++idCounter;
  return `${prefix}${id}`;
};

// eslint-disable-line no-plusplus
var safeRest = (({
  style,
  className,
  as,
  ...props
}) => props);

const BASE_FONT_SIZE = 16;
const pixelToRem = pixel => {
  return `${pixel / BASE_FONT_SIZE}rem`;
};

var DependentIconSizeContext = /*#__PURE__*/React.createContext({});

const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200
};
var media = {
  query: {},
  from(breakpoint) {
    if (breakpoint !== "xs") {
      this.query.minWidth = breakpoint;
    }
    return this;
  },
  until(breakpoint) {
    this.query.maxWidth = breakpoint;
    return this;
  },
  and(custom) {
    this.query.and = custom;
    return this;
  },
  css(style) {
    const {
      minWidth,
      maxWidth,
      and
    } = this.query;
    const min = minWidth ? `(min-width: ${breakpoints[minWidth]}px)` : undefined;
    const max = maxWidth ? `(max-width: ${breakpoints[maxWidth] - 1}px)` : undefined;
    if (typeof min !== "undefined" || typeof max !== "undefined" || typeof and !== "undefined") {
      const mediaQuery = `@media ${[min, max, and].filter(a => a).join(" and ")}`;
      this.query = {};
      return {
        [mediaQuery]: {
          ...(typeof style === "function" ? style() : style)
        }
      };
    }
    return typeof style === "function" ? style() : style;
  }
};

const BREAKPOINTS = ["xs", "sm", "md", "lg", "xl"];
const MOBILE_BREAKPOINTS = ["xs", "sm"];
const DESKTOP_BREAKPOINTS = ["md", "lg", "xl"];
const isMobileBreakpoint = breakpoint => MOBILE_BREAKPOINTS.indexOf(breakpoint) !== -1;
const isDesktopBreakpoint = breakpoint => DESKTOP_BREAKPOINTS.indexOf(breakpoint) !== -1;
const isResponsiveProp = prop => prop && BREAKPOINTS.find(breakpoint => Object.prototype.hasOwnProperty.call(prop, breakpoint));
const getResponsiveProps = props => Object.keys(props).filter(prop => isResponsiveProp(props[prop]));
const getStaticProps = props => Object.keys(props).filter(prop => !isResponsiveProp(props[prop]));
const sortBreakpointAsc = (a, b) => {
  if (BREAKPOINTS.indexOf(a.from) > BREAKPOINTS.indexOf(b.from)) {
    return 1;
  }
  if (BREAKPOINTS.indexOf(a.from) < BREAKPOINTS.indexOf(b.from)) {
    return -1;
  }
  return 0;
};
const collectBreakpoints = props => breakpoint => {
  const o = {
    from: breakpoint,
    until: undefined,
    props: {
      ...getStaticProps(props).reduce((acc, staticProp) => {
        if (typeof props[staticProp] !== "undefined") {
          acc[staticProp] = props[staticProp];
        }
        return acc;
      }, {}),
      ...getResponsiveProps(props).reduce((acc, responsiveProp) => {
        if (typeof props[responsiveProp][breakpoint] !== "undefined") {
          acc[responsiveProp] = props[responsiveProp][breakpoint];
        }
        return acc;
      }, {})
    }
  };
  return o;
};
const inheritAndPopulateUntil = (bp, index, src) => {
  const breakpoint = bp;
  if (index !== 0) {
    breakpoint.props = {
      ...src[index - 1].props,
      ...bp.props
    };
  }
  if (index < src.length - 1) {
    breakpoint.until = src[index + 1].from;
  }
  return breakpoint;
};
const prepareArray = props => {
  // gather all breakpoints
  const responsivePropNames = getResponsiveProps(props);
  const breakpoints = [];
  responsivePropNames.forEach(responsivePropName => {
    Object.keys(props[responsivePropName]).forEach(breakpoint => {
      if (breakpoints.indexOf(breakpoint) === -1) {
        breakpoints.push(breakpoint);
      }
    });
  });

  // build object
  if (breakpoints.length === 0) {
    breakpoints.push("xs");
  }
  const preparedArray = breakpoints.map(collectBreakpoints(props)).sort(sortBreakpointAsc).map(inheritAndPopulateUntil);
  return preparedArray;
};
const generateStyles = (breakpoints, style) => {
  const styles = breakpoints.reduce((acc, breakpoint) => {
    const props = breakpoint.props;
    if (!(typeof breakpoint.from === "undefined" && typeof breakpoint.until === "undefined")) {
      const result = media.from(breakpoint.from === "xs" ? undefined : breakpoint.from).until(breakpoint.until === "xl" ? undefined : breakpoint.until).css(typeof style === "function" ? style(props, breakpoint.from, breakpoint.until) : style);
      return {
        ...acc,
        ...result
      };
    }
    return acc;
  }, {});
  return styles;
};
const handleBoundaryCrossing = (acc, curr) => {
  if (isMobileBreakpoint(curr.from) && (curr.until !== "md" && isDesktopBreakpoint(curr.until) || typeof curr.until === "undefined")) {
    const props = Object.keys(curr.props).filter(prop => typeof curr.props[prop] === "number" && curr.props[prop] > 3);
    if (props.length !== 0) {
      const mobileBreakpoint = {
        ...curr,
        props: curr.props
      };
      const desktopBreakpoint = {
        ...curr,
        props: curr.props
      };
      mobileBreakpoint.until = "md";
      desktopBreakpoint.from = "md";
      return acc.concat([mobileBreakpoint, desktopBreakpoint]);
    }
  }
  return acc.concat([curr]);
};
const handleResponsiveStyles = (props, styleFn) => {
  const breakpoints = prepareArray(props).filter(bp => Object.keys(bp.props).length > 0).reduce(handleBoundaryCrossing, []);
  return generateStyles(breakpoints, styleFn);
};

const StyledA11yContent = styled.span({
  position: "absolute",
  height: "1px",
  width: "1px",
  overflow: "hidden",
  clip: "rect(1px, 1px, 1px, 1px)"
});
const A11yContent = ({
  children,
  ...rest
}) => {
  return /*#__PURE__*/React.createElement(StyledA11yContent, safeRest(rest), children);
};
A11yContent.propTypes = {
  children: or([PropTypes.string, componentWithName("Heading")]).isRequired
};
A11yContent.defaultProps = {};

function _extends$1() {
  _extends$1 = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}

const spacing = {
  mobile: {
    0: "0rem",
    1: "0.25rem",
    2: "0.5rem",
    3: "1rem",
    4: "1.5rem",
    5: "2rem",
    6: "2.5rem",
    7: "3rem",
    8: "4rem"
  },
  desktop: {
    0: "0rem",
    1: "0.25rem",
    2: "0.5rem",
    3: "1rem",
    4: "2rem",
    5: "3rem",
    6: "4rem",
    7: "4.5rem",
    8: "6rem"
  }
};
const convertToRem = (level, breakpoint) => {
  if (["xs", "sm"].indexOf(breakpoint) !== -1) {
    return spacing.mobile[level];
  }
  return spacing.desktop[level];
};
const inlineBetweenStyles = props => handleResponsiveStyles({
  between: props.between,
  inline: props.inline
}, ({
  between,
  inline
}, breakpoint) => {
  const base = {
    display: between !== undefined ? "flex" : "block",
    flexDirection: inline ? "row" : "column"
  };
  if (between === undefined) {
    return base;
  }
  if (between === "space-between") {
    return Object.assign(base, {
      justifyContent: "space-between"
    });
  }
  const rem = convertToRem(between, breakpoint);
  return Object.assign(base, {
    "> *:not(:last-child)": {
      ...(inline ? {
        marginRight: rem
      } : {
        marginBottom: rem
      })
    }
  });
});
const horizontalStyles = props => handleResponsiveStyles({
  horizontal: props.horizontal
}, ({
  horizontal
}, breakpoint) => {
  if (horizontal === undefined) {
    return undefined;
  }
  const rem = convertToRem(horizontal, breakpoint);
  return {
    paddingLeft: rem,
    paddingRight: rem
  };
});
const verticalStyles = props => handleResponsiveStyles({
  vertical: props.vertical
}, ({
  vertical
}, breakpoint) => {
  if (vertical === undefined) {
    return undefined;
  }
  const rem = convertToRem(vertical, breakpoint);
  return {
    paddingTop: rem,
    paddingBottom: rem
  };
});
const insetStyles = props => handleResponsiveStyles({
  inset: props.inset
}, ({
  inset
}, breakpoint) => {
  if (inset === undefined) {
    return undefined;
  }
  const rem = convertToRem(inset, breakpoint);
  return {
    paddingTop: rem,
    paddingBottom: rem,
    paddingLeft: rem,
    paddingRight: rem
  };
});
const belowStyles = props => handleResponsiveStyles({
  below: props.below
}, ({
  below
}, breakpoint) => {
  if (below === undefined) {
    return undefined;
  }
  const rem = convertToRem(below, breakpoint);
  return {
    marginBottom: rem
  };
});
const StyledBox = styled.div.attrs(({
  className,
  tag
}) => {
  return {
    className,
    as: tag
  };
})(inlineBetweenStyles, horizontalStyles, verticalStyles, insetStyles, belowStyles);
const Box = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(StyledBox, _extends$1({}, props, {
  ref: ref
})));
Box.displayName = "Box";
Box.propTypes = {
  tag: PropTypes.string,
  vertical: responsiveProps(PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8])),
  horizontal: responsiveProps(PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8])),
  inset: responsiveProps(PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8])),
  below: responsiveProps(PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8])),
  between: responsiveProps(PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, "space-between"])),
  inline: responsiveProps(PropTypes.bool),
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};
Box.defaultProps = {
  inline: false,
  tag: "div",
  vertical: undefined,
  horizontal: undefined,
  inset: undefined,
  below: undefined,
  between: undefined,
  className: undefined
};

// colours
const colorShark = "#2a2c2e";
const colorAthensGrey = "#f7f7f8";
const colorShuttleGrey = "#54595f";
const colorGainsboro = "#d8d8d8";
const colorDarkRaja = "#8C5415";
const colorRaja = "#FACA69";
const colorLightRaja = "#FFF9EE";

// brand
const colorNemetonGreen = "#6c0";
const colorNemetonPurple = "#0077b6";
const colorAccessibleGreen = "#2B8000";
const colorWhite = "#fff";

// grey
const colorGreyShark = "#2a2c2e";
const colorGreyShuttle = "#54595f";
const colorGreyRaven = "#71757b";
const colorGreyGainsboro = "#d8d8d8";
const colorGreyAthens = "#f7f7f8";

// notification
const colorLavenderBlush = "#fff6f8";
const colorPanache = "#f4f9f2";
const colorWhiteLilac = "#f2eff4";
const colorCardinal = "#c12335";
const colorRajahDark = "#8C5415";
const colorRajah = "#FACA69";
const colorRajahLight = "#FFF9EE";

// typography
const colorLink = colorGreyShuttle;
const colorText = colorGreyShark;

// tokens
const colorPrimary = colorAccessibleGreen;
const colorSecondary = colorNemetonPurple;

// icons
const colorIconPrimary = colorPrimary;
const colorIconSecondary = colorSecondary;
const colorIconDisabled = colorGreyShuttle;
const colorIconError = colorCardinal;

var colours = /*#__PURE__*/Object.freeze({
  __proto__: null,
  colorAccessibleGreen: colorAccessibleGreen,
  colorAthensGrey: colorAthensGrey,
  colorCardinal: colorCardinal,
  colorDarkRaja: colorDarkRaja,
  colorGainsboro: colorGainsboro,
  colorGreyAthens: colorGreyAthens,
  colorGreyGainsboro: colorGreyGainsboro,
  colorGreyRaven: colorGreyRaven,
  colorGreyShark: colorGreyShark,
  colorGreyShuttle: colorGreyShuttle,
  colorIconDisabled: colorIconDisabled,
  colorIconError: colorIconError,
  colorIconPrimary: colorIconPrimary,
  colorIconSecondary: colorIconSecondary,
  colorLavenderBlush: colorLavenderBlush,
  colorLightRaja: colorLightRaja,
  colorLink: colorLink,
  colorNemetonGreen: colorNemetonGreen,
  colorNemetonPurple: colorNemetonPurple,
  colorPanache: colorPanache,
  colorPrimary: colorPrimary,
  colorRaja: colorRaja,
  colorRajah: colorRajah,
  colorRajahDark: colorRajahDark,
  colorRajahLight: colorRajahLight,
  colorSecondary: colorSecondary,
  colorShark: colorShark,
  colorShuttleGrey: colorShuttleGrey,
  colorText: colorText,
  colorWhite: colorWhite,
  colorWhiteLilac: colorWhiteLilac
});

const fontNemeton = "'Nemeton-Web','Helvetica Neue', Helvetica, Arial, sans-serif";
const helveticaNeueThin35 = {
  fontWeight: 300
};
const helveticaNeueLight45 = {
  fontWeight: 400
};
const helveticaNeueRoman55 = {
  fontWeight: 500
};
const helveticaNeueMedium65 = {
  fontWeight: 700
};
const sizeSmall = {
  fontSize: "0.875rem",
  letterSpacing: -0.6,
  lineHeight: "1.42857"
};
const sizeMedium = {
  fontSize: "1rem",
  letterSpacing: -0.8,
  lineHeight: "1.5"
};
const sizeLarge = {
  fontSize: "1.25rem",
  letterSpacing: -1,
  lineHeight: "1.6"
};
const wordBreak = {
  wordWrap: "break-word"
};
const baseSupSubScripts = {
  position: "relative",
  verticalAlign: "baseline",
  paddingLeft: "0.1em"
};
const sup = {
  top: "-0.5em",
  fontSize: "0.875rem",
  ...baseSupSubScripts
};
const base$3 = {
  ...wordBreak,
  fontSize: "inherit"
};
const baseFont = {
  fontWeight: "inherit"
};
const small = {
  ...wordBreak,
  ...sizeSmall
};
const smallFont = {
  ...helveticaNeueRoman55
};
const medium = {
  ...wordBreak,
  ...sizeMedium
};
const mediumFont = {
  ...helveticaNeueLight45
};
const large = {
  ...wordBreak,
  ...sizeLarge
};
const largeFont = {
  ...wordBreak,
  ...helveticaNeueLight45
};
const boldFont = {
  ...wordBreak,
  ...helveticaNeueMedium65
};
const color = {
  color: colorText
};
const invertedColor = {
  color: colorWhite
};
const blockText = {
  display: "block"
};

var typography = /*#__PURE__*/Object.freeze({
  __proto__: null,
  base: base$3,
  baseFont: baseFont,
  baseSupSubScripts: baseSupSubScripts,
  blockText: blockText,
  boldFont: boldFont,
  color: color,
  fontNemeton: fontNemeton,
  helveticaNeueLight45: helveticaNeueLight45,
  helveticaNeueMedium65: helveticaNeueMedium65,
  helveticaNeueRoman55: helveticaNeueRoman55,
  helveticaNeueThin35: helveticaNeueThin35,
  invertedColor: invertedColor,
  large: large,
  largeFont: largeFont,
  medium: medium,
  mediumFont: mediumFont,
  sizeLarge: sizeLarge,
  sizeMedium: sizeMedium,
  sizeSmall: sizeSmall,
  small: small,
  smallFont: smallFont,
  sup: sup,
  wordBreak: wordBreak
});

const textColor = ({
  invert
}) => invert ? invertedColor : color;
const textInheritColor = ({
  inheritColor
}) => inheritColor ? {
  color: "inherit"
} : undefined;
const textSize = ({
  size
}) => typography[size];
const textBold = ({
  bold,
  size
}) => bold ? boldFont : typography[`${size}Font`];
const textBlock = ({
  block
}) => block ? blockText : undefined;

// This named export is not guaranteed to be maintained and may be removed at any time.
const StyledText = styled.span(textColor, textInheritColor, textSize, textBold, textBlock, {
  sup: sup
});
const Text = ({
  children,
  size,
  invert,
  ...rest
}, context) => /*#__PURE__*/React.createElement(DependentIconSizeContext.Provider, {
  value: {
    paragraphSize: size,
    invert
  }
}, /*#__PURE__*/React.createElement(StyledText, _extends$1({}, safeRest(rest), {
  size: size,
  invert: invert,
  inheritColor: context.inheritColor
}), children));
Text.propTypes = {
  block: PropTypes.bool,
  bold: PropTypes.bool,
  size: PropTypes.oneOf(["base", "small", "medium", "large"]),
  invert: PropTypes.bool,
  children: PropTypes.node.isRequired
};
Text.defaultProps = {
  block: false,
  bold: false,
  size: "base",
  invert: false
};
Text.contextTypes = {
  inheritColor: PropTypes.bool
};

const deprecate = (componentName, message) => {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  console.warn(`[NDS] [Deprecate] ${componentName}: ${message}`); // eslint-disable-line no-console
};

const warn = (componentName, message) => {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  console.warn(`[NDS] ${componentName}: ${message}`); // eslint-disable-line no-console
};

const HeadingLevels = {
  h1: {
    ...helveticaNeueLight45,
    fontSize: "1.75rem",
    lineHeight: "1.29",
    // 36px
    letterSpacing: "-1.6px",
    ...media.from("md").css({
      ...helveticaNeueThin35,
      fontSize: "2.75rem",
      lineHeight: "1.18",
      letterSpacing: "0"
    }),
    sup: {
      ...baseSupSubScripts,
      fontSize: "1.25rem",
      top: "-1em",
      ...media.from("md").css({
        fontSize: "1.25rem",
        top: "-1.3em"
      })
    }
  },
  h2: {
    ...helveticaNeueLight45,
    fontSize: "1.5rem",
    lineHeight: "1.33",
    // 30px
    letterSpacing: "-0.7px",
    ...media.from("md").css({
      fontSize: "1.75rem",
      lineHeight: "1.29",
      letterSpacing: "-0.8px"
    }),
    sup: {
      ...baseSupSubScripts,
      fontSize: "1rem",
      top: "-0.8em",
      ...media.from("md").css({
        fontSize: "1rem",
        top: "-0.7em"
      })
    }
  },
  h3: {
    ...helveticaNeueMedium65,
    fontSize: "1.25rem",
    lineHeight: "1.4",
    // 28px
    letterSpacing: "-0.6px",
    sup: {
      ...baseSupSubScripts,
      fontSize: "0.875rem",
      top: "-0.5em"
    }
  },
  h4: {
    ...helveticaNeueMedium65,
    fontSize: "1rem",
    lineHeight: "1.25",
    // 20px
    letterSpacing: "-0.6px",
    sup: {
      ...baseSupSubScripts,
      fontSize: "0.875rem",
      top: "-0.5em"
    }
  }
};
const StyledHeading = styled.h1(wordBreak, ({
  level,
  invert
}) => {
  const baseColor = level === "h1" || level === "h2" ? colorSecondary : colorText;
  const color = invert ? colorWhite : baseColor;
  return {
    color,
    ...HeadingLevels[`${level}`],
    "& > span": {
      letterSpacing: "inherit"
    }
  };
});
const Heading = /*#__PURE__*/React.forwardRef(({
  level,
  tag = level,
  invert,
  children,
  ...rest
}, ref) => {
  return /*#__PURE__*/React.createElement(StyledHeading, _extends$1({}, safeRest(rest), {
    ref: ref,
    as: tag,
    level: level,
    invert: invert,
    "data-testid": "heading"
  }), children);
});
Heading.displayName = "Heading";
Heading.propTypes = {
  level: PropTypes.oneOf(["h1", "h2", "h3", "h4"]).isRequired,
  tag: PropTypes.oneOf(["h1", "h2", "h3", "h4", "div", "span"]),
  invert: PropTypes.bool,
  children: PropTypes.node.isRequired
};
Heading.defaultProps = {
  invert: false,
  tag: undefined
};

const BenefitItem$1 = ({
  icon: Icon,
  heading,
  children,
  ...rest
}) => {
  if (Icon === undefined || typeof Icon === "undefined") {
    warn("BenefitWitHeading", "An icon must be set in either BenefitWithHeading or BenefitWithHeading.Item.");
  }
  return /*#__PURE__*/React.createElement(Box, _extends$1({}, safeRest(rest), {
    between: 3,
    inline: true,
    tag: "li"
  }), Icon && /*#__PURE__*/React.createElement(Box, {
    vertical: 1
  }, /*#__PURE__*/React.createElement(Icon, {
    size: 24,
    variant: "default"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Heading, {
    level: "h4",
    tag: "div"
  }, heading), /*#__PURE__*/React.createElement(Text, {
    size: "small"
  }, children)));
};
BenefitItem$1.propTypes = {
  icon: componentWithName("DecorativeIcon", true),
  heading: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};
BenefitItem$1.defaultProps = {
  icon: undefined
};
BenefitItem$1.displayName = "BenefitWithHeading.Item";

const cloneChild$1 = (icon, child) => {
  if (child.props.icon) {
    return child;
  }
  return /*#__PURE__*/React.cloneElement(child, {
    icon
  });
};
const BenefitWithHeading = ({
  icon,
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(Box, _extends$1({}, safeRest(rest), {
  tag: "ul",
  between: 3
}), React.Children.map(children, child => cloneChild$1(icon, child)));
BenefitWithHeading.propTypes = {
  icon: componentWithName("DecorativeIcon", true),
  children: componentWithName("BenefitItem").isRequired
};
BenefitWithHeading.defaultProps = {
  icon: undefined
};
BenefitWithHeading.Item = BenefitItem$1;

const BenefitItem = ({
  icon: Icon,
  children,
  ...rest
}) => {
  if (Icon === undefined || typeof Icon === "undefined") {
    warn("BenefitNoHeading", "An icon must be set in either BenefitNoHeading or BenefitNoHeading.Item.");
  }
  return /*#__PURE__*/React.createElement(Box, _extends$1({}, safeRest(rest), {
    between: 3,
    inline: true,
    tag: "li"
  }), Icon && /*#__PURE__*/React.createElement(Icon, {
    size: 24,
    variant: "default"
  }), /*#__PURE__*/React.createElement(Text, {
    size: "small"
  }, children));
};
BenefitItem.propTypes = {
  icon: componentWithName("DecorativeIcon", true),
  children: PropTypes.node.isRequired
};
BenefitItem.defaultProps = {
  icon: undefined
};
BenefitItem.displayName = "BenefitNoHeading.Item";

const cloneChild = (icon, child) => {
  if (child.props.icon) {
    return child;
  }
  return /*#__PURE__*/React.cloneElement(child, {
    icon
  });
};
const BenefitNoHeading = ({
  icon,
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(Box, _extends$1({}, safeRest(rest), {
  tag: "ul",
  between: 3
}), React.Children.map(children, child => cloneChild(icon, child)));
BenefitNoHeading.propTypes = {
  icon: componentWithName("DecorativeIcon", true),
  children: componentWithName("BenefitItem").isRequired
};
BenefitNoHeading.defaultProps = {
  icon: undefined
};
BenefitNoHeading.Item = BenefitItem;

const thin = {
  borderWidth: 1,
  borderStyle: "solid"
};
const none = {
  borderWidth: "0"
};
const rounded = {
  borderRadius: "4px"
};
const circular = {
  borderRadius: "50%"
};

const standard = {
  backgroundColor: colorGreyAthens
};
const success = {
  backgroundColor: colorPanache
};
const error = {
  backgroundColor: colorLavenderBlush
};
const warning = {
  backgroundColor: colorRajahLight
};

const noSpacing = {
  padding: 0,
  margin: 0
};

const relative = {
  position: "relative"
};
const absolute = {
  position: "absolute"
};
const centerVertically = {
  top: "50%",
  transform: "translateY(-50%)"
};

const inputHeight = {
  height: "3rem"
};
const font = {
  fontFamily: fontNemeton
};
const baseButton$1 = {
  boxSixing: "border-box",
  margin: 0,
  padding: "0 2rem",
  cursor: "pointer",
  background: "none",
  transition: "background 0.2s",
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  minHeight: "3.25rem",
  ...media.from("md").css({
    display: "inline-flex",
    width: "auto",
    minWidth: "180px"
  }),
  "&:after": {
    content: "",
    minHeight: "inherit",
    fontSize: 0
  }
};

const noStyle = {
  ...noSpacing,
  ...none,
  ...font,
  ...color,
  appearance: "none",
  background: "none",
  boxShadow: "none",
  cursor: "pointer"
};

const fixLineHeight = {
  lineHeight: 1
};

/*
By default, browsers outline links in their own way. (Chrome/Safari do a light blue outline, Firefox/IE do a dotted line, etc)
Firefox also uses the text color for the outline, causing it to be invisible for primary and secondary ButtonLinks.

So, reset the outlines to fix Firefox and use browser defaults.

Solution from here: https://stackoverflow.com/questions/7538771/what-is-webkit-focus-ring-color
*/

const focusOutline = {
  ":focus": {
    // outline: 'dotted 1px Highlight', // TOOD: cannot have duplicate keys with style-objects.
    outline: "auto 5px -webkit-focus-ring-color"
  }
};

const base$2 = {
  "&": {
    paddingLeft: "3rem"
  },
  "& &": {
    marginTop: "1rem",
    marginBottom: "0.5rem"
  }
};

const preventDisabling = ({
  disabled,
  ...props
}) => {
  if (disabled) {
    warn("Button", "Buttons are not able to be disabled.");
  }
  return props;
};
const getVariant$1 = ({
  variant,
  rank
}) => {
  let backgroundColor;
  let color;
  let border;
  let transition;
  const hover = {};
  const active = {};
  const focus = {};
  if (variant === "standard" || variant === "brand" || variant === "danger") {
    focus.outline = "none !important";
    transition = "background 0.2s, color 0.2s, border 0.2s ease";
  } else {
    hover.boxShadow = "0 0 0 0.0625rem";
  }
  switch (variant) {
    case "primary":
      backgroundColor = colorPrimary;
      color = colorWhite;
      hover.backgroundColor = colorWhite;
      hover.color = colorPrimary;
      break;
    case "secondary":
      backgroundColor = colorSecondary;
      color = colorWhite;
      hover.backgroundColor = colorWhite;
      hover.color = colorSecondary;
      break;
    case "inverted":
      backgroundColor = colorWhite;
      color = colorText;
      hover.backgroundColor = "transparent";
      hover.color = colorWhite;
      break;
    case "standard":
      if (rank === "main") {
        backgroundColor = colorAccessibleGreen;
        color = colorWhite;
        hover.backgroundColor = "#1F5C09";
        hover.boxShadow = "0 0 0 0.125rem #1F5C09";
        active.backgroundColor = "#163E06 !important";
        focus.backgroundColor = "#1F5C09";
        focus.boxShadow = `0 0 0 0.1875rem #509F33, 0 0 0 0.125rem ${colorWhite} inset`;
      } else {
        backgroundColor = colorWhite;
        color = colorAccessibleGreen;
        border = `0.0625rem solid ${colorAccessibleGreen}`;
        hover.boxShadow = `0 0 0 0.125rem ${colorAccessibleGreen}`;
        active.backgroundColor = "#F4F9F2";
        active.color = "#1F5C09";
        focus.border = "0.0625rem solid #509F33";
        focus.boxShadow = `0 0 0 0.125rem #509F33, 0 0 0 0.125rem ${colorWhite} inset, 0 0 0 0.1875rem ${colorAccessibleGreen} inset`;
      }
      break;
    case "brand":
      if (rank === "main") {
        backgroundColor = colorNemetonPurple;
        color = colorWhite;
        hover.backgroundColor = "#371E4F";
        hover.boxShadow = "0 0 0 0.125rem #371E4F";
        active.backgroundColor = "#231332 !important";
        focus.backgroundColor = "#371E4F";
        focus.boxShadow = `0 0 0 0.1875rem #7C53A5 , 0 0 0 0.125rem ${colorWhite} inset`;
      } else {
        backgroundColor = colorWhite;
        color = colorNemetonPurple;
        border = `0.0625rem solid ${colorNemetonPurple}`;
        hover.boxShadow = `0 0 0 0.125rem ${colorNemetonPurple}`;
        active.color = "#371E4F";
        active.backgroundColor = `${colorWhiteLilac}`;
        focus.border = "0.0625rem solid #7C53A5";
        focus.boxShadow = `0 0 0 0.125rem #7C53A5, 0 0 0 0.125rem ${colorWhite} inset, 0 0 0 0.1875rem ${colorNemetonPurple} inset`;
      }
      break;
    case "danger":
      backgroundColor = colorWhite;
      color = colorCardinal;
      border = `0.0625rem solid ${colorCardinal}`;
      hover.boxShadow = `0 0 0 0.125rem ${colorCardinal}`;
      active.color = "#770F1B";
      active.backgroundColor = `${colorLavenderBlush}`;
      focus.border = "0.0625rem solid #D7707B";
      focus.boxShadow = `0 0 0 0.125rem #D7707B, 0 0 0 0.125rem ${colorWhite} inset, 0 0 0 0.1875rem ${colorCardinal} inset`;
      break;
  }
  return {
    backgroundColor,
    color,
    border,
    transition,
    "&:hover": hover,
    "@media (hover: none)": {
      "&:hover": {
        boxShadow: "none",
        backgroundColor,
        color
      }
    },
    "&:active": active,
    "&:focus": focus,
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none !important"
    }
  };
};
const StyledButton = styled.button(none, rounded, medium, boldFont, font, baseButton$1, getVariant$1);
const ButtonTextWrapper = styled.span(({
  isOldButton
}) => ({
  width: "100%",
  marginTop: !isOldButton && "-1px"
}));
const isDeprecatedButtonVariant$1 = variant => {
  return ["primary", "secondary"].indexOf(variant) !== -1;
};
const Button = /*#__PURE__*/React.forwardRef(({
  type,
  variant,
  rank,
  children,
  ...rest
}, ref) => {
  const restNoDisabled = preventDisabling(rest);

  /* if (isDeprecatedButtonVariant(variant)) {
    deprecate(
      "core-button",
      "The 'primary' and 'secondary' variants have been deprecated."
    );
  } */

  return /*#__PURE__*/React.createElement(StyledButton, _extends$1({}, safeRest(restNoDisabled), {
    variant: variant,
    rank: rank,
    type: type,
    ref: ref
  }), /*#__PURE__*/React.createElement(ButtonTextWrapper, {
    isOldButton: isDeprecatedButtonVariant$1(variant)
  }, children));
});
Button.displayName = "Button";
Button.propTypes = {
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  variant: PropTypes.oneOf(["primary", "secondary", "inverted", "standard", "brand", "danger"]),
  rank: PropTypes.oneOf(["main", "common"]),
  children: or([PropTypes.string, componentWithName("A11yContent"), htmlElement("span")]).isRequired
};
Button.defaultProps = {
  type: "button",
  variant: "primary",
  rank: "common"
};

const sanitize = text => text.toString().toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
const generateId = (...choices) => {
  const id = sanitize(find(choices, choice => choice));
  return {
    identity: () => id,
    postfix: value => `${id}_${sanitize(value)}`
  };
};

const StyledButtonGroupItem = styled.div({
  margin: "0.5rem 0"
});
const StyledInput$1 = styled.input({
  position: "absolute",
  opacity: "0",
  "&:checked ~ label": {
    backgroundColor: colorNemetonPurple,
    boxShadow: `0px 0px 0px 0px ${colorNemetonPurple}`,
    color: colorWhite
  },
  "&:focus ~ label": {
    boxShadow: `0px 0px 0px 2px ${colorNemetonPurple}, 0px 0px 8px 1px ${colorNemetonPurple}`
  }
});
const StyledLabel$3 = styled.label(none, rounded, medium, boldFont, font, baseButton$1, {
  transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
  backgroundColor: colorWhite,
  boxShadow: `0px 0px 0px 1px ${colorNemetonPurple}`,
  color: colorNemetonPurple,
  whiteSpace: "nowrap",
  minWidth: "136px",
  "&:hover": {
    backgroundColor: colorWhite,
    color: colorNemetonPurple,
    boxShadow: `0px 0px 0px 2px ${colorNemetonPurple}, 0px 0px 8px 1px ${colorNemetonPurple}`
  },
  ...media.from("md").css({
    minWidth: "136px"
  })
});
const ButtonGroupItem = /*#__PURE__*/React.forwardRef(({
  name,
  value,
  checked,
  onChange,
  onFocus,
  onBlur,
  children,
  defaultChecked,
  readOnly,
  ...rest
}, ref) => {
  const itemId = generateId(name).postfix(value);
  return /*#__PURE__*/React.createElement(StyledButtonGroupItem, safeRest(rest), /*#__PURE__*/React.createElement(StyledInput$1, {
    id: itemId,
    name: name,
    value: value,
    type: "radio",
    checked: checked,
    onChange: onChange,
    onFocus: onFocus,
    onBlur: onBlur,
    defaultChecked: defaultChecked,
    readOnly: readOnly,
    ref: ref
  }), /*#__PURE__*/React.createElement(StyledLabel$3, {
    htmlFor: itemId
  }, children));
});
ButtonGroupItem.propTypes = {
  name: PropTypes.string,
  value: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  defaultChecked: PropTypes.bool,
  readOnly: PropTypes.bool,
  children: or([PropTypes.string, componentWithName("A11yContent")]).isRequired
};
ButtonGroupItem.defaultProps = {
  checked: undefined,
  name: undefined,
  onChange: undefined,
  onFocus: undefined,
  onBlur: undefined,
  defaultChecked: undefined,
  readOnly: undefined
};
ButtonGroupItem.displayName = "ButtonGroup.Item";

const StyledButtonGroup = styled(Box)({
  flexFlow: "row wrap",
  maxWidth: "784px"
});
const ButtonGroup = /*#__PURE__*/React.forwardRef(({
  name,
  onChange,
  onFocus,
  onBlur,
  value,
  label,
  children,
  readOnly,
  showFieldset,
  ...rest
}, ref) => {
  const passedButtons = React.Children.map(children, child => /*#__PURE__*/React.cloneElement(child, {
    name,
    onChange,
    onFocus,
    onBlur,
    checked: typeof value !== "undefined" ? value === child.props.value : undefined,
    readOnly
  }));
  const buttonValues = [];
  Object.keys(passedButtons).forEach(key => {
    buttonValues.push(passedButtons[key].props.value);
  });
  if (!showFieldset) {
    return /*#__PURE__*/React.createElement(Box, {
      between: 2
    }, /*#__PURE__*/React.createElement(Text, {
      bold: true,
      size: "medium"
    }, label), /*#__PURE__*/React.createElement(StyledButtonGroup, {
      between: 3,
      inline: true
    }, passedButtons));
  }
  return /*#__PURE__*/React.createElement("fieldset", _extends$1({}, safeRest(rest), {
    name: name,
    ref: ref
  }), /*#__PURE__*/React.createElement("legend", null, /*#__PURE__*/React.createElement(Text, {
    bold: true,
    size: "medium"
  }, label)), /*#__PURE__*/React.createElement(StyledButtonGroup, {
    between: 3,
    inline: true
  }, passedButtons));
});
ButtonGroup.displayName = "ButtonGroup";
ButtonGroup.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  readOnly: PropTypes.bool,
  showFieldset: PropTypes.bool,
  children: componentWithName("ButtonGroup.Item", true).isRequired
};
ButtonGroup.defaultProps = {
  onFocus: undefined,
  onBlur: undefined,
  onChange: undefined,
  value: undefined,
  readOnly: undefined,
  showFieldset: false
};
ButtonGroup.Item = ButtonGroupItem;

const VARIANT_PRIMARY = "primary";
const VARIANT_SECONDARY = "secondary";
const VARIANT_INVERTED = "inverted";
const VARIANT_STANDARD = "standard";
const VARIANT_BRAND = "brand";
const RANK_MAIN = "main";
const RANK_COMMON = "common";
const DEFAULT_VARIANT = VARIANT_PRIMARY;
const VALID_VARIANTS = [VARIANT_PRIMARY, VARIANT_SECONDARY, VARIANT_INVERTED, VARIANT_STANDARD, VARIANT_BRAND];
const getVisitedColor = (variant, rank) => {
  if (variant === VARIANT_PRIMARY || variant === VARIANT_SECONDARY) {
    return colorWhite;
  }
  if (variant === VARIANT_STANDARD) {
    return rank === RANK_MAIN ? colorWhite : colorPrimary;
  }
  if (variant === VARIANT_BRAND) {
    return rank === RANK_MAIN ? colorWhite : colorSecondary;
  }
  return colorText;
};
const getHoverColor = (variant, rank) => {
  if (variant === VARIANT_PRIMARY || variant === VARIANT_STANDARD && rank === RANK_COMMON) {
    return colorPrimary;
  }
  if (variant === VARIANT_SECONDARY || variant === VARIANT_BRAND && rank === RANK_COMMON) {
    return colorSecondary;
  }
  return colorWhite;
};
const hoverStyles = ({
  variant,
  rank
}) => {
  const hoverColor = getHoverColor(variant, rank);
  return {
    "@media(hover: hover)": {
      "&:hover": {
        color: hoverColor
      }
    }
  };
};
const visitedStyles = ({
  variant,
  rank
}) => {
  const color = getVisitedColor(variant, rank);
  return {
    "&:link,&:visited": {
      color
    }
  };
};
const StyledButtonLink = styled(StyledButton)(focusOutline, {
  textDecoration: "none"
}, visitedStyles, hoverStyles, ({
  fullWidth
}) => {
  const width = fullWidth ? "100%" : "auto";
  return {
    "&:link,&:visited": {
      width
    }
  };
});
const isDeprecatedButtonVariant = variant => {
  return ["primary", "secondary"].indexOf(variant) !== -1;
};
const validateVariant = variant => {
  if (VALID_VARIANTS.indexOf(variant) === -1) {
    return DEFAULT_VARIANT;
  }
  return variant;
};
const ButtonLink = /*#__PURE__*/React.forwardRef(({
  reactRouterLinkComponent,
  variant,
  fullWidth,
  children,
  ...rest
}, ref) => {
  if ((reactRouterLinkComponent || rest.to) && !(reactRouterLinkComponent && rest.to)) {
    warn("Link Button", "The props `reactRouterLinkComponent` and `to` must be used together.");
  }
  if (isDeprecatedButtonVariant(variant)) {
    deprecate("@nds-core/core-button-link", "The 'primary' and 'secondary' variants have been deprecated.");
  }
  return /*#__PURE__*/React.createElement(StyledButtonLink, _extends$1({}, safeRest(rest), {
    as: reactRouterLinkComponent || "a",
    variant: validateVariant(variant),
    ref: ref,
    fullWidth: fullWidth
  }), children);
});
ButtonLink.displayName = "ButtonLink";
ButtonLink.propTypes = {
  variant: PropTypes.oneOf(VALID_VARIANTS),
  rank: PropTypes.oneOf(["main", "common"]),
  reactRouterLinkComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  href: PropTypes.string,
  fullWidth: PropTypes.bool,
  children: or([PropTypes.string, componentWithName("A11yContent"), htmlElement("span")]).isRequired
};
ButtonLink.defaultProps = {
  variant: DEFAULT_VARIANT,
  rank: "common",
  reactRouterLinkComponent: null,
  to: null,
  href: null,
  fullWidth: false
};

class ColoredTextProvider extends React.Component {
  getChildContext() {
    return {
      inheritColor: true
    };
  }
  render() {
    const {
      colorClassName,
      className,
      tag,
      children
    } = this.props;
    return /*#__PURE__*/React.createElement(tag, {
      className: colorClassName || className
    }, children);
  }
}
ColoredTextProvider.propTypes = {
  colorClassName: PropTypes.string,
  className: PropTypes.string,
  tag: PropTypes.string,
  children: PropTypes.node.isRequired
};
ColoredTextProvider.defaultProps = {
  colorClassName: undefined,
  className: undefined,
  tag: "div"
};
ColoredTextProvider.childContextTypes = {
  inheritColor: PropTypes.bool
};

const StyledFeedback = styled(({
  feedback,
  ...rest
}) => /*#__PURE__*/React.createElement(Box, rest))(({
  feedback
}) => ({
  ...rounded,
  ...(feedback === "success" && success),
  ...(feedback === "error" && error),
  ...(feedback === undefined && standard)
}));
const InputFeedback = ({
  feedback,
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(StyledFeedback, _extends$1({}, safeRest(rest), {
  inset: 3,
  role: feedback === "error" ? "alert" : null,
  feedback: feedback
}), children);
InputFeedback.propTypes = {
  feedback: PropTypes.oneOf(["success", "error"]),
  children: PropTypes.node.isRequired
};
InputFeedback.defaultProps = {
  feedback: undefined
};

const paragraphColor = ({
  invert
}) => invert ? invertedColor : color;
const paragraphInheritColor = ({
  inheritColor
}) => inheritColor ? {
  color: "inherit"
} : undefined;
const paragraphSize = ({
  size
}) => typography[size];
const paragraphBold = ({
  bold,
  size
}) => bold ? boldFont : typography[`${size}Font`];
const paragraphAlign = ({
  align
}) => ({
  textAlign: align
});
const truncateText = ({
  truncate,
  numberOfLines
}) => truncate && {
  display: "-webkit-box",
  "-webkit-box-orient": "vertical",
  "-webkit-line-clamp": `${numberOfLines} !important`,
  overflow: "hidden"
};
const StyledParagraph = styled.p(paragraphColor, wordBreak, noSpacing, paragraphInheritColor, paragraphSize, paragraphBold, paragraphAlign, truncateText, {
  sup: sup
});
const Paragraph = ({
  size,
  invert,
  children,
  ...rest
}, context) => {
  return /*#__PURE__*/React.createElement(DependentIconSizeContext.Provider, {
    value: {
      paragraphSize: size,
      invert
    }
  }, /*#__PURE__*/React.createElement(StyledParagraph, _extends$1({}, safeRest(rest), {
    size: size,
    invert: invert,
    inheritColor: context.inheritColor,
    numberOfLines: rest.numberOfLines,
    truncate: rest.truncate
  }), children));
};
Paragraph.propTypes = {
  bold: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  align: PropTypes.oneOf(["left", "center", "right"]),
  invert: PropTypes.bool,
  children: PropTypes.node.isRequired,
  truncate: PropTypes.bool,
  numberOfLines: PropTypes.number
};
Paragraph.defaultProps = {
  bold: false,
  size: "medium",
  align: "left",
  invert: false
};
Paragraph.contextTypes = {
  inheritColor: PropTypes.bool
};

const StyledSVG = styled.svg(({
  width,
  height
}) => ({
  width: `${width}rem`,
  height: `${height}rem`
}));
const FeedbackIcon$1 = ({
  width,
  height,
  copy,
  copyDictionary,
  optionalText,
  children,
  ...rest
}) => {
  if (rest.onClick) {
    console.warn("FeedbackIcon", "FeedbackIcons are not meant to be interactive, do not pass an onClick handler.");
  }
  const a11yText = getCopy(copyDictionary, !optionalText ? copy || "en" : copy).a11yText;
  if (!optionalText && a11yText === "") {
    warn("FeedbackIcon", "The `copy` prop is required, please provide some copy by supplying an object with `a11yText` as a key and your copy as a value.");
  }
  return /*#__PURE__*/React.createElement(StyledSVG, _extends$1({}, safeRest(rest), {
    role: "img",
    "aria-hidden": a11yText === "" ? true : undefined,
    width: pixelToRem(width),
    height: pixelToRem(height)
  }), a11yText && /*#__PURE__*/React.createElement("title", null, a11yText), children);
};
FeedbackIcon$1.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired,
  copyDictionary: PropTypes.object,
  optionalText: PropTypes.bool,
  children: PropTypes.node.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired
};
FeedbackIcon$1.defaultProps = {
  optionalText: false,
  copyDictionary: {}
};

const Checkmark = props => {
  return /*#__PURE__*/React.createElement(FeedbackIcon$1, _extends$1({
    copy: {
      a11yText: ""
    }
  }, props, {
    optionalText: true,
    width: 16,
    height: 16,
    viewBox: "0 0 16 16"
  }), /*#__PURE__*/React.createElement("path", {
    fill: colorAccessibleGreen,
    fillRule: "evenodd",
    d: "M5.807 13.072a.592.592 0 0 1-.091.106l-.026.024-.1.112a.545.545 0 0 1-.433.185.581.581 0 0 1-.453-.204L1.159 9.2a.677.677 0 0 1 .014-.888.55.55 0 0 1 .812 0l3.155 3.382 8.872-9.512a.548.548 0 0 1 .816.002c.226.242.23.636.009.881l-9.03 10.008z"
  }));
};
Checkmark.displayName = "Checkmark";

const Times = props => {
  return /*#__PURE__*/React.createElement(FeedbackIcon$1, _extends$1({
    copy: {
      a11yText: ""
    }
  }, props, {
    optionalText: true,
    width: 16,
    height: 16,
    viewBox: "0 0 16 16"
  }), /*#__PURE__*/React.createElement("path", {
    fill: colorCardinal,
    fillRule: "evenodd",
    d: "M8 9.17l-4.931 4.637a.756.756 0 0 1-1.034-.021l.176.175a.718.718 0 0 1-.003-1.012l4.781-4.782a40.59 40.59 0 0 1-.083-.085l-4.72-5.017a.753.753 0 0 1 .03-1.03l-.176.177a.714.714 0 0 1 1.012-.003L8 7.157l4.948-4.948a.714.714 0 0 1 1.012.003l-.176-.176a.753.753 0 0 1 .03 1.029l-4.72 5.017a40.59 40.59 0 0 1-.083.085l4.781 4.782a.718.718 0 0 1-.003 1.012l.176-.175a.756.756 0 0 1-1.034.021L8 9.17z"
  }));
};
Times.displayName = "Times";

const copyDictionary$8 = {
  en: {
    a11yText: "Success"
  },
  fr: {
    a11yText: "Réussite"
  }
};
const NotificationSuccess = props => /*#__PURE__*/React.createElement(FeedbackIcon$1, _extends$1({}, props, {
  copyDictionary: copyDictionary$8,
  width: 20,
  height: 20,
  viewBox: "0 0 20 20"
}), /*#__PURE__*/React.createElement("path", {
  fill: colorAccessibleGreen,
  fillRule: "evenodd",
  d: "M0 10C0 4.48 4.48 0 10 0s10 4.48 10 10-4.48 10-10 10S0 15.52 0 10zm8.127 4.673a.633.633 0 0 0 .092-.105l7.734-8.572a.693.693 0 0 0-.009-.925.595.595 0 0 0-.882-.001l-7.514 8.055-2.612-2.8a.596.596 0 0 0-.88 0 .706.706 0 0 0-.014.928l3.038 3.51a.623.623 0 0 0 .486.219.587.587 0 0 0 .46-.2l.087-.097.014-.012z"
}));
NotificationSuccess.displayName = "NotificationSuccess";

const copyDictionary$7 = {
  en: {
    a11yText: "Warning"
  },
  fr: {
    a11yText: "Avertissement"
  }
};
const NotificationWarning = props => /*#__PURE__*/React.createElement(FeedbackIcon$1, _extends$1({}, props, {
  copyDictionary: copyDictionary$7,
  width: 20,
  height: 20,
  viewBox: "0 0 20 20"
}), /*#__PURE__*/React.createElement("path", {
  fill: colorRajahDark,
  fillRule: "evenodd",
  d: "M10.878 1.61l8.315 15.244a1 1 0 0 1-.878 1.48H1.685a1 1 0 0 1-.878-1.48L9.122 1.61a1 1 0 0 1 1.756 0zM10 16.794c.46 0 .833-.402.833-.898 0-.495-.373-.897-.833-.897-.46 0-.833.402-.833.897 0 .496.373.898.833.898zm-.022-2.885c.347 0 .63-.297.64-.67l.179-6.698c.01-.388-.28-.709-.64-.709h-.35c-.361 0-.65.32-.64.708l.171 6.699c.01.373.294.67.64.67z"
}));
NotificationWarning.displayName = "NotificationWarning";

const copyDictionary$6 = {
  en: {
    a11yText: "Error"
  },
  fr: {
    a11yText: "Erreur"
  }
};
const NotificationError = props => /*#__PURE__*/React.createElement(FeedbackIcon$1, _extends$1({}, props, {
  copyDictionary: copyDictionary$6,
  width: 20,
  height: 20,
  viewBox: "0 0 20 20"
}), /*#__PURE__*/React.createElement("path", {
  fill: colorCardinal,
  fillRule: "evenodd",
  d: "M0 10C0 4.48 4.48 0 10 0s10 4.48 10 10-4.48 10-10 10S0 15.52 0 10zm10 5.833a.833.833 0 1 0 0-1.666.833.833 0 0 0 0 1.666zm-.003-2.5c.354 0 .644-.306.654-.69l.182-6.912c.01-.4-.285-.731-.654-.731H9.82c-.369 0-.664.33-.654.73l.175 6.912c.01.385.3.691.655.691z"
}));
NotificationError.displayName = "NotificationError";

const ErrorText = styled(ColoredTextProvider)(({
  isError
}) => ({
  ...(isError && {
    color: colorCardinal
  })
}));
const FakeCheckbox = styled.span({
  height: "1.25rem",
  width: "1.25rem",
  minHeight: "1.25rem",
  minWidth: "1.25rem",
  outline: 0,
  lineHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  marginTop: "0.125rem",
  transition: "border-color 0.1s linear, background-color 0.1s linear",
  ...thin,
  ...rounded,
  borderColor: colorGreyShuttle,
  backgroundColor: colorWhite,
  "& > i": {
    display: "none"
  }
});
const HiddenInput$1 = styled.input({
  position: "absolute",
  width: "1.2rem",
  height: "1.2rem",
  margin: "2px 1px",
  opacity: "0",
  pointerEvents: "none"
});
const StyledLabel$2 = styled.label(({
  isError
}) => ({
  display: "flex",
  cursor: "pointer",
  ...(isError && {
    [`div > ${FakeCheckbox}`]: {
      borderColor: colorCardinal
    }
  }),
  [`${HiddenInput$1}:focus ~ & > div > ${FakeCheckbox}`]: {
    boxShadow: `0 0 4px 1px ${colorGreyShuttle}`,
    borderColor: isError ? colorCardinal : colorWhite
  },
  [`${HiddenInput$1}:checked ~ & > div > ${FakeCheckbox}`]: {
    backgroundColor: colorAccessibleGreen,
    borderColor: colorAccessibleGreen,
    "& > i": {
      display: "block"
    }
  },
  [`${HiddenInput$1}:disabled ~ & > div > ${FakeCheckbox}`]: {
    backgroundColor: colorGreyGainsboro,
    borderColor: colorGreyGainsboro
  },
  [`${HiddenInput$1}:disabled ~ & > div > div`]: {
    color: colorGreyGainsboro
  }
}));
const CheckmarkContainer = styled.span({
  "& > svg": {
    "& > path": {
      fill: colorWhite
    }
  }
});
const renderError$4 = (error, errorId) => /*#__PURE__*/React.createElement(InputFeedback, {
  id: errorId,
  feedback: "error"
}, /*#__PURE__*/React.createElement(Paragraph, {
  size: "small"
}, error || ""));
const getGeneratedId$1 = (name, value) => {
  return generateId(name).postfix(value);
};
const getErrorId$1 = (name, value, id) => {
  return generateId(id || getGeneratedId$1(name, value)).postfix("error-message");
};
const Checkbox = /*#__PURE__*/React.forwardRef(({
  id,
  name,
  value,
  label,
  feedback,
  error,
  ...rest
}, ref) => /*#__PURE__*/React.createElement(Box, {
  between: 2
}, feedback === "error" && renderError$4(error, getErrorId$1(name, value, id)), /*#__PURE__*/React.createElement(HiddenInput$1, _extends$1({
  type: "checkbox",
  id: id || getGeneratedId$1(name, value),
  name: name,
  value: value,
  "aria-invalid": feedback === "error",
  "aria-describedby": feedback === "error" ? getErrorId$1(name, value, id) : undefined,
  "data-testid": "hidden-input",
  ref: ref
}, safeRest(rest))), /*#__PURE__*/React.createElement(StyledLabel$2, {
  isError: feedback === "error",
  htmlFor: id || getGeneratedId$1(name, value),
  "data-testid": "checkbox-label"
}, /*#__PURE__*/React.createElement(Box, {
  between: 3,
  inline: true
}, /*#__PURE__*/React.createElement(FakeCheckbox, {
  "data-testid": "fake-input"
}, /*#__PURE__*/React.createElement(CheckmarkContainer, {
  id: "checkmark"
}, /*#__PURE__*/React.createElement(Checkmark, null))), /*#__PURE__*/React.createElement(ErrorText, {
  isError: feedback === "error"
}, /*#__PURE__*/React.createElement(Text, null, label))))));
Checkbox.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).isRequired,
  checked: PropTypes.bool,
  id: PropTypes.string,
  feedback: PropTypes.oneOf(["error"]),
  error: PropTypes.string
};
Checkbox.defaultProps = {
  id: undefined,
  feedback: undefined,
  error: undefined,
  checked: undefined
};
Checkbox.displayName = "Checkbox";

const StyledInteractiveIconSVG$1 = styled.svg(({
  theme
}) => ({
  fill: theme.iconColor
}), {
  width: "1.5rem",
  height: "1.5rem",
  zIndex: "2"
});

const animations = {
  reduceMotion: {
    "@media (prefers-reduced-motion: reduce)": {
      transition: "none"
    }
  },
  scale: {
    "&:hover svg": {
      transition: "transform 150ms ease-in-out",
      transform: "scale(1.1, 1.1)"
    },
    "&:active svg": {
      transition: "transform 150ms ease-in-out",
      transform: "scale(1, 1)"
    }
  }
};

const iconSize$1 = props => handleResponsiveStyles({
  size: props.size
}, ({
  size
}) => ({
  width: size === 20 ? "1.25rem" : "1.5rem",
  height: size === 20 ? "1.25rem" : "1.5rem"
}));
const StyledLimitedInteractiveIconSVG = styled(StyledInteractiveIconSVG$1)(({
  animationDirection
}) => ({
  transition: "transform 150ms ease-in-out",
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none"
  },
  [":hover, :focus, :active"]: {
    transform: `translate${animationDirection === "up" || animationDirection === "down" ? "Y" : "X"}(${animationDirection === "up" || animationDirection === "left" ? "-" : ""}4px)`
  }
}), animations.reduceMotion, iconSize$1);
const getTheme$2 = variant => {
  if (variant === "basic") {
    return {
      backgroundColor: "transparent",
      iconColor: colorShark
    };
  }
  if (variant === "alternative") {
    return {
      backgroundColor: "transparent",
      iconColor: colorNemetonPurple
    };
  }
  if (variant === "inverted") {
    return {
      backgroundColor: "transparent",
      iconColor: colorWhite
    };
  }
  if (variant === "error") {
    return {
      backgroundColor: "transparent",
      iconColor: colorCardinal
    };
  }
  return {
    backgroundColor: "transparent",
    iconColor: colorAccessibleGreen
  };
};
const Limited = ({
  variant,
  children,
  size
}) => /*#__PURE__*/React.createElement(styled.ThemeProvider, {
  theme: getTheme$2(variant),
  size: size
}, children);
Limited.displayName = "Limited";
Limited.propTypes = {
  /**
   * The style.
   */
  variant: PropTypes.oneOf(["default", "basic", "alternative", "inverted", "error"]),
  size: responsiveProps(PropTypes.oneOf([16, 24])),
  children: PropTypes.node.isRequired
};
Limited.defaultProps = {
  variant: "default",
  size: 24
};

const CaretUp = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(Limited, _extends$1({}, props, {
  animationDirection: "up",
  ref: ref
}), /*#__PURE__*/React.createElement(StyledLimitedInteractiveIconSVG, _extends$1({
  animationDirection: "up",
  viewBox: "0 0 24 24"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M17.7940812,14.8167698 C17.4424627,15.1174894 17.0896181,14.9549557 16.8868854,14.7547243 L11.9968161,10.259447 L7.11722187,14.7547243 C6.93839231,14.9185479 6.49053328,15.1800328 6.16524043,14.8167698 C5.83994757,14.4535067 6.06520964,14.0838947 6.24327169,13.9200711 L11.6348225,8.12339734 C11.8136521,7.95886755 12.1060729,7.95886755 12.2849025,8.12339734 C12.2849025,8.12410347 17.7940809,13.920071 17.7940809,13.920071 C17.9792355,14.0649573 18.1456996,14.5160501 17.7940812,14.8167698 Z"
}))));
CaretUp.displayName = "CaretUp";

const CaretDown = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(Limited, _extends$1({}, props, {
  ref: ref
}), /*#__PURE__*/React.createElement(StyledLimitedInteractiveIconSVG, _extends$1({
  animationDirection: "down",
  viewBox: "0 0 24 24"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M17.7940812,9.18323023 C17.4424627,8.8825106 17.0896181,9.04504427 16.8868854,9.24527574 L11.9968161,13.740553 L7.11722187,9.24527573 C6.93839231,9.08145209 6.49053328,8.81996721 6.16524043,9.18323023 C5.83994757,9.54649326 6.06520964,9.91610528 6.24327169,10.0799289 L11.6348225,15.8766027 C11.8136521,16.0411324 12.1060729,16.0411324 12.2849025,15.8766027 C12.2849025,15.8758965 17.7940809,10.079929 17.7940809,10.079929 C17.9792355,9.93504267 18.1456996,9.48394985 17.7940812,9.18323023 Z"
}))));
CaretDown.displayName = "CaretDown";

const ChevronLeft = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(Limited, _extends$1({}, props, {
  ref: ref
}), /*#__PURE__*/React.createElement(StyledLimitedInteractiveIconSVG, _extends$1({
  animationDirection: "left",
  viewBox: "0 0 24 24"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M14.8167698,17.7940812 C14.5160501,18.1456996 14.0649573,17.9792355 13.920071,17.7940809 C13.920071,17.7940809 8.12410347,12.2849025 8.12339734,12.2849025 C7.95886755,12.1060729 7.95886755,11.8136521 8.12339734,11.6348225 L13.9200711,6.24327169 C14.0838947,6.06520964 14.4535067,5.83994757 14.8167698,6.16524043 C15.1800328,6.49053328 14.9185479,6.93839231 14.7547243,7.11722187 L10.259447,11.9968161 L14.7547243,16.8868854 C14.9549557,17.0896181 15.1174894,17.4424627 14.8167698,17.7940812 Z"
}))));
ChevronLeft.displayName = "ChevronLeft";

const ChevronRight = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(Limited, _extends$1({}, props, {
  ref: ref
}), /*#__PURE__*/React.createElement(StyledLimitedInteractiveIconSVG, _extends$1({
  animationDirection: "right",
  viewBox: "0 0 24 24"
}, props), /*#__PURE__*/React.createElement("path", {
  d: "M9.18323023,17.7940812 C8.8825106,17.4424627 9.04504427,17.0896181 9.24527574,16.8868854 L13.740553,11.9968161 L9.24527573,7.11722187 C9.08145209,6.93839231 8.81996721,6.49053328 9.18323023,6.16524043 C9.54649326,5.83994757 9.91610528,6.06520964 10.0799289,6.24327169 L15.8766027,11.6348225 C16.0411324,11.8136521 16.0411324,12.1060729 15.8766027,12.2849025 C15.8758965,12.2849025 10.079929,17.7940809 10.079929,17.7940809 C9.93504267,17.9792355 9.48394985,18.1456996 9.18323023,17.7940812 Z"
}))));
ChevronRight.displayName = "ChevronRight";

const cartEmptyBoldCopyDictionary = {
  en: {
    a11yText: "Cart"
  },
  fr: {
    a11yText: "Panier"
  }
};
const cartFilledBoldCopyDictionary = {
  en: {
    a11yText: {
      single: "%{numItems} item in cart",
      multiple: "%{numItems} items in cart"
    }
  },
  fr: {
    a11yText: {
      single: "%{numItems} article dans le panier",
      multiple: "%{numItems} articles dans le panier"
    }
  }
};
const notifyBoldCopyDictionary = {
  en: {
    a11yText: "Notifications"
  },
  fr: {
    a11yText: "Avis"
  }
};
const newNotifyBoldCopyDictionary = {
  en: {
    a11yText: "New Notification(s)"
  },
  fr: {
    a11yText: "Nouvel Avis"
  }
};
const profileBoldCopyDictionary = {
  en: {
    a11yText: "Profile"
  },
  fr: {
    a11yText: "Profil"
  }
};
const searchBoldCopyDictionary = {
  en: {
    a11yText: "Search"
  },
  fr: {
    a11yText: "Chercher"
  }
};
const settingsBoldCopyDictionary = {
  en: {
    a11yText: "Settings"
  },
  fr: {
    a11yText: "Paramètres"
  }
};
const supportBoldCopyDictionary = {
  en: {
    a11yText: "Support"
  },
  fr: {
    a11yText: "Soutien"
  }
};
const userAddBoldCopyDictionary = {
  en: {
    a11yText: "Add subscriber"
  },
  fr: {
    a11yText: "Ajouter un utilisateur"
  }
};

const getOutline = ({
  variant
}) => {
  if (variant !== "inverted") {
    return {
      outline: "none",
      "&:focus::-moz-focus-inner": {
        border: 0
      }
    };
  }
  return {
    "&:focus": {
      outline: "transparent",
      border: `0.125rem solid ${colorWhite}`,
      borderRadius: "50%"
    },
    "&:active": {
      borderRadius: "50%",
      backgroundColor: "rgba(0,0,0,0.5)",
      backgroundBlendMode: "multiply"
    }
  };
};
const StyledInteractiveIconButton$1 = styled.button(noStyle, getOutline, {
  width: "2.5rem",
  height: "2.5rem",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  "-webkit-tap-highlight-color": "transparent"
});

const StyledInteractiveIconHover = styled.span(({
  theme
}) => ({
  backgroundColor: theme.hoverBackgroundColor
}), animations.reduceMotion, {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  transition: "transform 200ms ease-in-out",
  transform: "scale(0,0)",
  [`${StyledInteractiveIconButton$1}:focus &, ${StyledInteractiveIconButton$1}:active &`]: {
    transform: "scale(1,1)"
  }
});

const StyledTooltip$1 = styled.div(animations.reduceMotion, {
  position: "absolute",
  padding: "0.0625rem 0.5rem 0.1875rem 0.5rem",
  maxWidth: "8.25rem",
  backgroundColor: colorGreyShuttle,
  border: `1px solid ${colorWhite}`,
  borderRadius: "0.25rem",
  zIndex: 4,
  marginTop: "0.25rem",
  visibility: "hidden",
  opacity: 0,
  transition: "opacity 200ms",
  [`${StyledInteractiveIconButton$1}:hover + &,${StyledInteractiveIconButton$1}:focus + &`]: {
    visibility: "visible",
    opacity: 1
  },
  [`${StyledInteractiveIconButton$1}:focus + &`]: {
    zIndex: 3 // lower the zIndex on the tooltip focused on to prevent it from being displayed on top of the tooltip being hovered over
  }
}, ({
  width
}) => {
  if (width) {
    return {
      marginLeft: `calc(${width}px / -2 + 1.25rem)`
    };
  }
  return {};
});
const Tooltip$1 = ({
  children,
  ...props
}) => {
  const tooltipRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    setWidth(tooltipRef.current.offsetWidth);
  }, []);
  return /*#__PURE__*/React.createElement(StyledTooltip$1, _extends$1({}, props, {
    role: "tooltip",
    ref: tooltipRef,
    width: width,
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement(Text, {
    size: "small",
    invert: true
  }, children));
};
Tooltip$1.propTypes = {
  children: PropTypes.node.isRequired
};

const StyledInteractiveIconSVG = styled(StyledInteractiveIconSVG$1)({
  transition: "transform 150ms ease-in-out"
}, animations.reduceMotion);
const StyledInteractiveIconButton = styled(StyledInteractiveIconButton$1)(animations.scale, animations.reduceMotion);
const StyledButtonAndTooltip = styled.div({
  display: "inline-block"
});
const getTheme$1 = variant => {
  if (variant === "inverted") {
    return {
      hoverBackgroundColor: "transparent",
      iconColor: colorWhite
    };
  }
  return {
    hoverBackgroundColor: colorGreyGainsboro,
    iconColor: colorGreyShuttle
  };
};
const NavButton = /*#__PURE__*/React.forwardRef(({
  a11yText,
  variant,
  onClick,
  children,
  tag,
  ...rest
}, ref) => {
  const ariaId = uniqueId(a11yText.replace(/\s+/g, "-").toLowerCase());
  return /*#__PURE__*/React.createElement(styled.ThemeProvider, {
    theme: getTheme$1(variant)
  }, /*#__PURE__*/React.createElement(StyledButtonAndTooltip, null, /*#__PURE__*/React.createElement(StyledInteractiveIconButton, _extends$1({}, safeRest(rest), {
    "aria-labelledby": ariaId,
    variant: variant,
    onClick: onClick,
    as: tag,
    ref: ref
  }), /*#__PURE__*/React.createElement(StyledInteractiveIconHover, null), children), /*#__PURE__*/React.createElement(Tooltip$1, {
    id: ariaId
  }, a11yText)));
});
NavButton.displayName = "NavButton";
NavButton.propTypes = {
  /**
   * Use the copy prop to either select provided English or French copy
   * by passing `'en'` or `'fr'` respectively.
   *
   * To provide your own, pass an object with the key `a11yText`.
   */
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired,
  /**
   * @ignore
   * A description of the icon for screen readers, also appears as the hint when hovering over the icon.
   */
  a11yText: PropTypes.string,
  /**
   * The style.
   */
  variant: PropTypes.oneOf(["default", "inverted"]),
  /**
   * Pass a handler to the icon to make it interactive.
   */
  onClick: PropTypes.func,
  /**
   * The tag
   */
  tag: PropTypes.oneOf(["button", "a"]),
  /**
   * @ignore
   */
  children: PropTypes.node.isRequired
};
NavButton.defaultProps = {
  a11yText: undefined,
  variant: "default",
  onClick: undefined,
  tag: "button"
};

const CartEmptyBold = /*#__PURE__*/React.forwardRef(({
  copy,
  ...props
}, ref) => /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
  ref: ref,
  a11yText: getCopy(cartEmptyBoldCopyDictionary, copy).a11yText,
  copy: copy // Passed in to satisfy styleguidist workaround
}), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M17.526 18c1.394 0 2.527 1.123 2.527 2.504 0 1.379-1.133 2.503-2.527 2.503-1.393 0-2.526-1.124-2.526-2.503C15 19.123 16.133 18 17.526 18zm0 1.539a.97.97 0 00-.974.965.97.97 0 00.974.964.97.97 0 00.975-.964.97.97 0 00-.975-.965zm-9 1.929a.97.97 0 01-.974-.964.97.97 0 01.974-.965.97.97 0 01.975.965.97.97 0 01-.975.964zm0-3.468c1.394 0 2.527 1.123 2.527 2.504 0 1.379-1.133 2.503-2.527 2.503C7.133 23.007 6 21.883 6 20.504 6 19.123 7.133 18 8.526 18zM2.025 2h2.627c.446 0 .838.284.975.691l.031.114.36 1.745h16.137c.297 0 .578.125.774.343.17.189.26.432.254.681l-.011.125-.781 5.466a1.878 1.878 0 01-1.496 1.553l-.158.025-12.596 1.553c.268.41.683.68 1.137.73l.152.008h10.975c.567 0 1.027.451 1.027 1.004 0 .517-.4.944-.915.998l-.112.006H9.43c-1.63 0-3.119-1.185-3.538-2.786l-.044-.187L3.812 4.008H2.025C1.46 4.008 1 3.558 1 3.004c0-.516.4-.943.914-.998L2.025 2h2.627-2.627zm18.948 4.559H6.429l1.145 5.712 12.804-1.507.595-4.205z",
  fillRule: "evenodd"
}))));
CartEmptyBold.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired
};
CartEmptyBold.displayName = "CartEmptyBold";

const CartFilledBold = /*#__PURE__*/React.forwardRef(({
  copy,
  variant,
  numItems,
  ...props
}, ref) => {
  let a11yText = getCopy(cartFilledBoldCopyDictionary, copy).a11yText;
  if (typeof a11yText === "object") {
    if (numItems > 1) {
      a11yText = a11yText.multiple;
    } else {
      a11yText = a11yText.single;
    }
  }
  return /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
    ref: ref,
    a11yText: a11yText.replace("%{numItems}", numItems),
    variant: variant,
    copy: copy // Passed in to satisfy styleguidist workaround
  }), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("g", {
    fillRule: "evenodd"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M17.527 18c1.393 0 2.526 1.122 2.526 2.503 0 1.379-1.133 2.503-2.526 2.503-1.394 0-2.527-1.124-2.527-2.503C15 19.122 16.133 18 17.527 18zm0 1.539a.969.969 0 00-.974.964.97.97 0 00.974.965.97.97 0 00.974-.965.97.97 0 00-.974-.964zm-9 1.929a.97.97 0 01-.974-.965c0-.533.436-.964.974-.964a.97.97 0 01.974.964.97.97 0 01-.974.965zm0-3.468c1.394 0 2.527 1.122 2.527 2.503 0 1.379-1.133 2.503-2.527 2.503C7.133 23.006 6 21.882 6 20.503 6 19.122 7.133 18 8.527 18zM2.028 2h2.625c.446 0 .838.29.975.702l.031.116.333 1.726h10.141l.06.166c.156.438.392.84.72 1.224l.171.19.4.422H6.409l1.167 5.761 12.801-1.536.474-3.283.172-.036c.48-.099.938-.285 1.368-.558l.212-.143.477-.341-.688 4.765a1.899 1.899 0 01-1.494 1.579l-.157.026-12.634 1.518c.266.392.689.65 1.163.697l.16.008h10.976c.566 0 1.027.457 1.027 1.019 0 .525-.402.959-.915 1.014l-.112.006H9.43a3.657 3.657 0 01-3.537-2.723l-.043-.185L3.812 4.037H2.028A1.024 1.024 0 011 3.019c0-.525.402-.958.916-1.013L2.028 2h2.625-2.625z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M23.25 3.061c0 1.689-1.386 3.061-3.091 3.061-1.703 0-3.089-1.372-3.089-3.061C17.07 1.373 18.456 0 20.159 0c1.705 0 3.091 1.373 3.091 3.061z",
    fill: variant === "inverted" ? colorNemetonGreen : colorAccessibleGreen
  }))));
});
CartFilledBold.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired,
  variant: PropTypes.oneOf(["default", "inverted"]),
  numItems: PropTypes.number.isRequired
};
CartFilledBold.defaultProps = {
  variant: "default"
};
CartFilledBold.displayName = "CartFilledBold";

const NotifyBold = /*#__PURE__*/React.forwardRef(({
  copy,
  ...props
}, ref) => /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
  ref: ref,
  a11yText: getCopy(notifyBoldCopyDictionary, copy).a11yText,
  copy: copy // Passed in to satisfy styleguidist workaround
}), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 0c1.322 0 2.41 1.008 2.494 2.276l.006.16v1.346c2.54.86 4.402 3.006 4.728 5.73l.036.699c.014.333.026.75.026 1.176l-.003.698c.002 1.206.085 2.45.824 3.831l.169.298 1.542 2.544c.228.373.237.844.02 1.228-.196.35-.55.58-.946.623l-.133.007h-5.865l.025.19c.008.079.012.134.012.181 0 1.661-1.323 3.013-2.95 3.013-1.627 0-2.95-1.352-2.95-3.013 0-.063.006-.142.02-.251l.016-.12H3.237c-.45 0-.863-.24-1.081-.63a1.22 1.22 0 01-.046-1.102l.069-.129 1.545-2.547c.937-1.57 1.027-2.962.993-4.352l-.014-.606c-.006-.859.062-1.666.065-1.704.318-2.658 2.067-4.76 4.48-5.674l.252-.09V2.436C9.5 1.093 10.622 0 12 0zm1.136 20.616h-2.302c-.003.042-.01.083-.01.126 0 .755.52 1.367 1.16 1.367.64 0 1.16-.612 1.16-1.367 0-.043-.005-.084-.008-.126zM12 5.372c-2.697 0-4.807 1.696-5.21 4.152l-.032.225s-.068.823-.053 1.62l.016.662c.018 1.447-.12 3.098-1.11 4.904l-.174.304-.835 1.377h14.795l-.831-1.37c-1.128-1.891-1.27-3.592-1.279-5.023l.003-1a30.047 30.047 0 00-.053-1.528c-.303-2.523-2.46-4.323-5.237-4.323zm0-3.46c-.38 0-.696.27-.746.622l-.006.097v.778a7.63 7.63 0 011.255-.02l.248.02v-.778c0-.397-.337-.719-.751-.719z",
  fillRule: "evenodd"
}))));
NotifyBold.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired
};
NotifyBold.displayName = "NotifyBold";

const UnreadNotification = /*#__PURE__*/React.forwardRef(({
  copy,
  ...props
}, ref) => /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
  ref: ref,
  a11yText: getCopy(newNotifyBoldCopyDictionary, copy).a11yText,
  copy: copy // Passed in to satisfy styleguidist workaround
}), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M11.9996,0.0002 C13.32248,0.0002 14.4094304,1.0075088 14.4942698,2.27629395 L14.4996,2.4362 L14.4996,3.7822 C17.0406,4.6412 18.9016,6.7882 19.2276,9.5122 L19.264225,10.210825 C19.2778969,10.5438719 19.2901332,10.9612332 19.290299,11.3872916 L19.2869987,12.0848432 C19.2886515,13.2905843 19.3717282,14.535302 20.1109442,15.9161784 L20.2796,16.2142 L21.8216,18.7582 C22.0496,19.1312 22.0586,19.6022 21.8426,19.9862 C21.6464,20.3363 21.29144,20.56652 20.895818,20.609063 L20.7626,20.6162 L14.8976,20.6162 L14.92272,20.806408 C14.93136,20.8846 14.9346,20.9404 14.9346,20.9872 C14.9346,22.6482 13.6116,24.0002 11.9846,24.0002 C10.3576,24.0002 9.0346,22.6482 9.0346,20.9872 C9.0346,20.9242 9.0407875,20.8448875 9.05442812,20.7357625 L9.0706,20.6162 L3.2366,20.6162 C2.7876,20.6162 2.3736,20.3752 2.1556,19.9862 C1.96448889,19.6448667 1.94957531,19.2347926 2.11015693,18.8838022 L2.1786,18.7552 L3.7236,16.2082 C4.66101176,14.6373765 4.75070035,13.246373 4.71715669,11.8559427 L4.70291651,11.2504571 C4.69690796,10.3912865 4.76495294,9.58414118 4.7676,9.5462 C5.08563333,6.88786667 6.83523556,4.78646222 9.24770152,3.87248748 L9.4996,3.7822 L9.4996,2.4362 C9.4996,1.0932 10.6216,0.0002 11.9996,0.0002 Z M13.1356,20.6162 L10.8336,20.6162 C10.8306,20.6582 10.8246,20.6992 10.8246,20.7422 C10.8246,21.4972 11.3446,22.1092 11.9846,22.1092 C12.6246,22.1092 13.1446,21.4972 13.1446,20.7422 C13.1446,20.6992 13.1386,20.6582 13.1356,20.6162 Z M11.9996,5.3722 C9.30330588,5.3722 7.19296159,7.06787474 6.78954113,9.52386011 L6.7576,9.7492 C6.7576,9.7492 6.68992422,10.5718562 6.70453604,11.3692989 L6.72060161,12.0306112 C6.73938419,13.4781932 6.60148186,15.128641 5.61079631,16.9349293 L5.4366,17.2392 L4.6016,18.6162 L19.3966,18.6162 L18.5656,17.2452 C17.4376909,15.3547 17.2965649,13.6536504 17.2874235,12.2232152 L17.2896605,11.2226492 C17.2835219,10.4270281 17.237475,9.70395 17.2366,9.6952 C16.9336,7.1722 14.7776,5.3722 11.9996,5.3722 Z M11.9996,1.9122 C11.6191833,1.9122 11.3043083,2.18276944 11.2544709,2.53365544 L11.2476,2.6312 L11.2476,3.4092 C11.4956,3.3862 11.7456,3.3722 11.9996,3.3722 C12.1689333,3.3722 12.3364889,3.37842222 12.502563,3.38938519 L12.7506,3.4092 L12.7506,2.6312 C12.7506,2.2342 12.4136,1.9122 11.9996,1.9122 Z"
}), /*#__PURE__*/React.createElement("circle", {
  id: "Indicator",
  stroke: props?.variant === "inverted" ? colorNemetonPurple : colorWhite,
  fill: props?.variant === "inverted" ? colorNemetonGreen : colorAccessibleGreen,
  cx: "18.5",
  cy: "8.5",
  r: "5"
}))));
UnreadNotification.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired
};
UnreadNotification.displayName = "UnreadNotification";

const ProfileBold = /*#__PURE__*/React.forwardRef(({
  copy,
  ...props
}, ref) => /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
  ref: ref,
  a11yText: getCopy(profileBoldCopyDictionary, copy).a11yText,
  copy: copy // Passed in to satisfy styleguidist workaround
}), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M11.999 1C18.065 1 23 5.934 23 11.999c0 6.066-4.935 11-11.001 11-6.065 0-10.999-4.934-10.999-11C1 5.934 5.934 1 11.999 1zm0 13.455c-2.747 0-5.096 1.99-5.648 4.628a9.024 9.024 0 0011.296 0c-.552-2.637-2.902-4.628-5.648-4.628zm0-11.524c-5 0-9.068 4.068-9.068 9.068 0 2.063.7 3.961 1.864 5.487 1.129-2.902 3.972-4.962 7.204-4.962 3.231 0 6.075 2.06 7.205 4.962a9.013 9.013 0 001.865-5.487c0-5-4.07-9.068-9.07-9.068zm0 1.248a3.866 3.866 0 013.862 3.862 3.866 3.866 0 01-3.862 3.861 3.866 3.866 0 01-3.861-3.861 3.866 3.866 0 013.861-3.862zm0 1.93c-1.065 0-1.93.867-1.93 1.932 0 1.064.865 1.93 1.93 1.93s1.931-.866 1.931-1.93c0-1.065-.866-1.931-1.93-1.931z",
  fillRule: "evenodd"
}))));
ProfileBold.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired
};
ProfileBold.displayName = "ProfileBold";

const SearchBold = /*#__PURE__*/React.forwardRef(({
  copy,
  ...props
}, ref) => /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
  ref: ref,
  a11yText: getCopy(searchBoldCopyDictionary, copy).a11yText,
  copy: copy // Passed in to satisfy styleguidist workaround
}), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M10.022 1l.253.003c4.994.13 8.935 4.278 8.806 9.267a8.985 8.985 0 01-1.728 5.087l-.189.249 5.604 5.897c.3.316.306.802.034 1.133l-.074.08-.03.028a.945.945 0 01-1.173.098l-.092-.072-6.081-5.418a9.01 9.01 0 01-5.543 1.719c-4.993-.13-8.935-4.278-8.806-9.267C1.13 4.898 5.144 1.008 10.023 1zm.02 1.81a7.214 7.214 0 100 14.43 7.214 7.214 0 000-14.43z"
}))));
SearchBold.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired
};
SearchBold.displayName = "SearchBold";

const SettingsBold = /*#__PURE__*/React.forwardRef(({
  copy,
  ...props
}, ref) => /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
  ref: ref,
  a11yText: getCopy(settingsBoldCopyDictionary, copy).a11yText,
  copy: copy // Passed in to satisfy styleguidist workaround
}), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M9.929 1h4.145c.678 0 1.26.458 1.401 1.086l.022.127.32 2.17c.265.126.527.269.783.426l.253.161 2.108-.824c.646-.232 1.354-.007 1.718.515l.069.108 2.06 3.479a1.393 1.393 0 01-.245 1.713l-.104.09-1.79 1.36a6.798 6.798 0 01.014.989l-.013.188 1.784 1.36c.516.4.684 1.079.428 1.663l-.062.124-2.084 3.514c-.311.559-1.002.827-1.64.652l-.126-.041-2.12-.83c-.258.17-.514.321-.774.457l-.26.13-.321 2.188c-.081.635-.624 1.13-1.287 1.189l-.135.006H9.928c-.679 0-1.26-.458-1.4-1.084l-.023-.127-.32-2.171a8.527 8.527 0 01-.784-.426l-.253-.162-2.11.825c-.658.232-1.351.013-1.716-.516l-.068-.11-2.061-3.476c-.326-.583-.218-1.278.245-1.712l.105-.09 1.79-1.364a6.502 6.502 0 01-.014-.97l.014-.205-1.784-1.36a1.383 1.383 0 01-.413-1.698l.062-.115 2.067-3.486c.313-.56 1.003-.832 1.64-.653l.127.042 2.12.83c.258-.17.514-.322.774-.458l.26-.13.322-2.19c.08-.634.622-1.129 1.287-1.188L9.929 1h4.145H9.93zm.4 1.803l-.39 2.334a.91.91 0 01-.558.695 6.98 6.98 0 00-1.551.878.94.94 0 01-.784.152l-.114-.037-2.203-.863-1.733 2.85 1.883 1.495c.247.19.38.505.34.817a7.023 7.023 0 00-.067.876c0 .253.022.533.066.88a.884.884 0 01-.257.741l-.09.078-1.904 1.451 1.696 2.86 2.277-.837a.98.98 0 01.898.125 6.763 6.763 0 001.54.87c.265.106.465.33.54.6l.023.102.337 2.29 3.394.037.39-2.332a.898.898 0 01.564-.697 7.088 7.088 0 001.546-.877.942.942 0 01.783-.151l.115.036 2.203.863 1.758-2.892-1.901-1.449a.889.889 0 01-.347-.822l.037-.321c.017-.172.029-.359.029-.555 0-.327-.033-.628-.066-.878a.891.891 0 01.257-.742l.089-.078 1.906-1.451-1.696-2.86-2.278.838a.932.932 0 01-.897-.125 6.754 6.754 0 00-1.54-.87.916.916 0 01-.542-.602l-.022-.102-.335-2.288-3.396-.039zM12 9.116a2.887 2.887 0 012.884 2.883A2.887 2.887 0 0112 14.883 2.886 2.886 0 019.117 12 2.886 2.886 0 0112 9.116zm4.583 2.883A4.588 4.588 0 0012 7.417a4.588 4.588 0 00-4.583 4.582A4.588 4.588 0 0012 16.582 4.588 4.588 0 0016.583 12z",
  fillRule: "evenodd"
}))));
SettingsBold.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired
};
SettingsBold.displayName = "SettingsBold";

const SupportBold = /*#__PURE__*/React.forwardRef(({
  copy,
  ...props
}, ref) => /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
  ref: ref,
  a11yText: getCopy(supportBoldCopyDictionary, copy).a11yText,
  copy: copy // Passed in to satisfy styleguidist workaround
}), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 1c6.065 0 11 4.934 11 11 0 6.065-4.935 11-11 11-6.066 0-11-4.935-11-11C1 5.934 5.934 1 12 1zm0 1.878c-5.03 0-9.122 4.093-9.122 9.122 0 5.03 4.093 9.122 9.122 9.122 5.03 0 9.122-4.092 9.122-9.122S17.029 2.878 12 2.878zm0 12.58a1.17 1.17 0 110 2.34 1.17 1.17 0 010-2.34zm-.045-9.005c.694 0 1.274.096 1.738.285.463.19.837.427 1.12.711.284.285.488.589.608.917.123.326.184.632.184.915 0 .47-.061.855-.184 1.158a2.81 2.81 0 01-.454.777 3.04 3.04 0 01-.6.55c-.22.151-.428.302-.624.454a2.928 2.928 0 00-.52.52 1.417 1.417 0 00-.256.562l-.03.17v.558h-1.978v-.66c.03-.42.11-.772.241-1.055.133-.283.287-.525.462-.725.177-.201.361-.374.557-.522.196-.145.377-.292.542-.438.166-.148.302-.308.404-.484.102-.175.148-.395.14-.66 0-.449-.11-.78-.33-.996-.22-.215-.526-.323-.917-.323-.263 0-.49.051-.681.155-.19.102-.347.239-.469.41-.123.17-.213.37-.271.6a2.803 2.803 0 00-.082.546l-.005.195H8.394c.01-.529.1-1.011.273-1.451.17-.44.41-.82.717-1.144a3.223 3.223 0 011.114-.753 3.753 3.753 0 011.457-.272z",
  fillRule: "evenodd"
}))));
SupportBold.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired
};
SupportBold.displayName = "SupportBold";

const UserAddBold = /*#__PURE__*/React.forwardRef(({
  copy,
  ...props
}, ref) => /*#__PURE__*/React.createElement(NavButton, _extends$1({}, props, {
  ref: ref,
  a11yText: getCopy(userAddBoldCopyDictionary, copy).a11yText,
  copy: copy // Passed in to satisfy styleguidist workaround
}), /*#__PURE__*/React.createElement(StyledInteractiveIconSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M18.205 14C20.849 14 23 16.085 23 18.647c0 2.562-2.15 4.647-4.795 4.647-2.644 0-4.795-2.085-4.795-4.647 0-2.562 2.151-4.647 4.795-4.647zm0 1.72c-1.68 0-3.047 1.313-3.047 2.927s1.366 2.927 3.047 2.927c1.68 0 3.048-1.313 3.048-2.927s-1.368-2.927-3.048-2.927zm0 .782c.42 0 .768.311.82.713l.006.102v.515h.552a.82.82 0 01.825.815.819.819 0 01-.722.807l-.103.007h-.552v.516c0 .449-.371.814-.827.814a.823.823 0 01-.818-.712l-.007-.102v-.516h-.55a.821.821 0 01-.827-.814.82.82 0 01.723-.808l.103-.007h.551v-.515c0-.45.37-.815.825-.815zM10.038 1c1.072 0 1.609.231 2.13.662 1.73.012 2.636 1.561 2.69 4.605l.003.3c0 2.992 1.033 3.9 1.043 3.909.243.184.38.484.356.795a.925.925 0 01-.474.738l-.16.069c-.44.178-1.715.64-3.248.899a.965.965 0 01-.732-.16.89.89 0 01-.371-.594.966.966 0 01.751-1.074c.742-.1 1.331-.237 1.777-.368-.42-.787-.81-2.015-.851-3.879l-.004-.335c0-2.149-.444-2.981-.764-3.042l-.037-.004h-.352a.973.973 0 01-.665-.26l-.164-.15c-.242-.215-.374-.251-.928-.251-.255 0-.993.17-1.644.695-.838.678-1.263 1.691-1.263 3.012 0 2.054-.413 3.382-.858 4.216.44.129 1.019.263 1.734.356a.967.967 0 01.658.391.91.91 0 01.164.646l-.021.114-.302 1.132a.938.938 0 01-.588.638l-.112.034-2.898.682c-.765.181-1.387.661-1.722 1.296l-.078.162h2.053c.527 0 .957.418.957.931a.924.924 0 01-.833.924l-.111.006H1.956a.977.977 0 01-.663-.259.925.925 0 01-.293-.67c0-1.923 1.325-3.597 3.249-4.141l.208-.054 1.472-.348c-1.092-.296-1.644-.617-1.65-.62a.916.916 0 01-.168-1.476l.105-.087c.108-.11.94-1.032.997-3.593l.003-.28C5.216 2.4 8.53 1 10.04 1zm8.45 0c1.45 0 2.514.472 3.16 1.404.67.96.674 1.932.017 2.69l-.122.132-.1.097-.034.635a1.561 1.561 0 01.66 1.32l-.012.15-.175 1.325a1.587 1.587 0 01-.832 1.187 5.361 5.361 0 01-1.462 2.555.91.91 0 01-.711.32c-.204 0-.414-.061-.594-.193a.914.914 0 01-.371-.63.941.941 0 01.133-.615l.076-.105.054-.057c.607-.535 1.009-1.31 1.074-2.073a.929.929 0 01.653-.809l.11-.028.113-.852a.93.93 0 01-.659-.806l-.002-.127.086-1.657a.898.898 0 01.208-.533l.082-.087.35-.331c.05-.05.117-.119-.127-.47-.268-.387-.798-.584-1.574-.584-.655 0-1.352.06-1.999.493a.982.982 0 01-1.315-.218.906.906 0 01-.172-.698.933.933 0 01.402-.615C16.632 1 17.933 1 18.489 1z",
  fillRule: "evenodd"
}))));
UserAddBold.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string.isRequired
  })]).isRequired
};
UserAddBold.displayName = "UserAddBold";

const positionStyles = ({
  paragraphSize
}) => {
  let top = 0;
  if (paragraphSize === "large") {
    top = "-4px";
  }
  return {
    position: "relative",
    top
  };
};
const StyledDependentSVG = styled.svg.attrs({
  "aria-hidden": true,
  focusable: false
})(positionStyles, ({
  paragraphSize
}) => ({
  width: paragraphSize === "small" ? "1.25rem" : "1.5rem",
  height: paragraphSize === "small" ? "1.25rem" : "1.5rem"
}), ({
  color
}) => {
  let fill;
  if (color === "greyShark") {
    fill = colorGreyShark;
  } else if (color === "white") {
    fill = colorWhite;
  } else if (color === "nemetonPurple") {
    fill = colorNemetonPurple;
  } else if (color === "accessibleGreen") {
    fill = colorAccessibleGreen;
  }
  return {
    fill
  };
});
const Dependent = ({
  children,
  ...rest
}) => {
  return /*#__PURE__*/React.createElement(DependentIconSizeContext.Consumer, null, ({
    paragraphSize
  }) => {
    return /*#__PURE__*/React.cloneElement(children, {
      paragraphSize,
      "data-testid": "dependentSvg",
      ...rest
    });
  });
};
Dependent.propTypes = {
  /**
   * @ignore
   */
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(["greyShark", "white", "nemetonPurple", "accessibleGreen"])
};
Dependent.defaultProps = {
  color: "greyShark"
};

const Close$1 = props => /*#__PURE__*/React.createElement(Dependent, props, /*#__PURE__*/React.createElement(StyledDependentSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12 12.707l-4.147 4.146a.498.498 0 0 1-.707 0 .5.5 0 0 1 0-.707L11.293 12 7.146 7.853a.5.5 0 0 1 .707-.707L12 11.293l4.146-4.147a.5.5 0 0 1 .707.707L12.707 12l4.146 4.146a.5.5 0 0 1-.707.707L12 12.707zM12 24C5.383 24 0 18.617 0 12S5.383 0 12 0s12 5.383 12 12-5.383 12-12 12zm0-22.957C5.958 1.043 1.043 5.958 1.043 12c0 6.042 4.915 10.957 10.957 10.957 6.042 0 10.957-4.915 10.957-10.957 0-6.042-4.915-10.957-10.957-10.957z",
  fillRule: "nonzero"
})));
Close$1.displayName = "Dependent";

const QuestionMarkCircle = props => /*#__PURE__*/React.createElement(Dependent, props, /*#__PURE__*/React.createElement(StyledDependentSVG, {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  clipRule: "evenodd",
  fillRule: "evenodd",
  d: "M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2V2ZM13.0001 19H11.0001V17H13.0001V19V19ZM14.1699 12.17C13.4499 12.9 12.9999 13.5 12.9999 15H10.9999V14.5C10.9999 13.4 11.4499 12.4 12.1699 11.67L13.4099 10.41C13.7799 10.05 13.9999 9.55001 13.9999 9.00001C13.9999 7.90001 13.0999 7.00001 11.9999 7.00001C10.8999 7.00001 9.99989 7.90001 9.99989 9.00001H7.99989C7.99989 6.79001 9.78989 5.00001 11.9999 5.00001C14.2099 5.00001 15.9999 6.79001 15.9999 9.00001C15.9999 9.88001 15.6399 10.68 15.0699 11.25L14.1699 12.17Z"
})));
QuestionMarkCircle.displayName = "Dependent";

const StyledIconButton$1 = styled(StyledInteractiveIconButton$1)(animations.scale, {
  "&:hover > svg": animations.reduceMotion
});
const getTheme = variant => {
  if (variant === "alternative") {
    return {
      hoverBackgroundColor: "#D8CBE5"
    };
  }
  if (variant === "inverted") {
    return {
      hoverBackgroundColor: "transparent"
    };
  }
  return {
    hoverBackgroundColor: colorGreyGainsboro
  };
};
const IconButton = /*#__PURE__*/React.forwardRef(({
  a11yText,
  variant,
  onClick,
  tag,
  icon: Icon,
  ...rest
}, ref) => {
  let color;
  if (variant === "alternative") {
    color = "colorNemetonPurple";
  } else if (variant === "inverted") {
    color = "white";
  } else {
    color = "greyShark";
  }
  if (Icon.name !== "Add" && Icon.name !== "Close" && Icon.name !== "Subtract" && Icon.name !== "PlayVideo") {
    warn("IconButton", "IconButton is meant to be used with the Add, Close, Subtract, and PlayVideo icons for their universally-recognizable appearance. Other icons should be accompanied with text and not as a part of IconButton.");
  }
  return /*#__PURE__*/React.createElement(styled.ThemeProvider, {
    theme: getTheme(variant)
  }, /*#__PURE__*/React.createElement(StyledIconButton$1, _extends$1({}, safeRest(rest), {
    variant: variant,
    onClick: onClick,
    as: tag,
    ref: ref
  }), /*#__PURE__*/React.createElement(A11yContent, null, a11yText), /*#__PURE__*/React.createElement(StyledInteractiveIconHover, null), /*#__PURE__*/React.createElement(Icon, {
    color: color
  })));
});
IconButton.displayName = "IconButton";
IconButton.propTypes = {
  a11yText: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["default", "alternative", "inverted"]),
  onClick: PropTypes.func,
  tag: PropTypes.oneOf(["button", "a"]),
  icon: PropTypes.oneOfType([componentWithName("Add"), componentWithName("Close"), componentWithName("PlayVideo"), componentWithName("Subtract")]).isRequired
};
IconButton.defaultProps = {
  variant: "default",
  onClick: undefined,
  tag: "button"
};

const base$1 = {
  display: "inline-block",
  textDecoration: "none",
  maxWidth: "100%",
  verticalAlign: "top"
};
const variantDict = {
  primary: "default",
  secondary: "alternative",
  inverted: "inverted"
};
const StyledChevronLink = styled.a(medium, helveticaNeueRoman55, base$1, ({
  variant
}) => {
  let color;
  if (variant === "secondary") {
    color = colorSecondary;
  } else if (variant === "inverted") {
    color = colorWhite;
  } else {
    color = colorPrimary;
  }
  return {
    "&:link,&:visited": {
      color
    }
  };
});
const StyledChevron$1 = styled.span(({
  direction
}) => ({
  display: "inline-block",
  transition: "transform 300ms",
  [`${StyledChevronLink}:hover &`]: {
    transform: `translateX(${direction === "right" ? "0.25rem" : "-0.25rem"})`
  }
}));
const getIcon = (direction, variant) => /*#__PURE__*/React.createElement(StyledChevron$1, {
  direction: direction
}, direction === "left" && /*#__PURE__*/React.createElement(ChevronLeft, {
  size: 16,
  variant: variant
}), direction === "right" && /*#__PURE__*/React.createElement(ChevronRight, {
  size: 16,
  variant: variant
}));
const ChevronLink = /*#__PURE__*/React.forwardRef(({
  reactRouterLinkComponent,
  variant,
  direction,
  children,
  ...rest
}, ref) => {
  if ((reactRouterLinkComponent || rest.to) && !(reactRouterLinkComponent && rest.to)) {
    warn("Chevron Link", "The props `reactRouterLinkComponent` and `to` must be used together.");
  }
  const iconVariant = variantDict[variant];
  const innerLink = /*#__PURE__*/React.createElement(Box, {
    tag: "span",
    inline: true,
    between: 2
  }, direction === "left" ? getIcon(direction, iconVariant) : undefined, /*#__PURE__*/React.createElement("span", null, children), direction === "right" ? getIcon(direction, iconVariant) : undefined);
  return /*#__PURE__*/React.createElement(StyledChevronLink, _extends$1({}, safeRest(rest), {
    as: reactRouterLinkComponent || "a",
    variant: variant,
    direction: direction,
    ref: ref
  }), innerLink);
});
ChevronLink.displayName = "ChevronLink";
ChevronLink.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "inverted"]),
  direction: PropTypes.oneOf(["left", "right"]),
  reactRouterLinkComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  href: PropTypes.string,
  children: or([PropTypes.string, componentWithName("A11yContent"), htmlElement("span")]).isRequired
};
ChevronLink.defaultProps = {
  variant: "primary",
  direction: "right",
  reactRouterLinkComponent: null,
  to: null,
  href: null
};

const icons = {
  default: {
    fontFamily: "NEMETON Core Icons" /* stylelint-disable-line font-family-no-missing-generic-family-keyword */,
    display: "inline-block",
    fontWeight: "normal",
    fontStyle: "normal",
    speak: "none",
    textDecoration: "inherit",
    textTransform: "none",
    textRendering: "auto",
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "grayscale",
    lineHeight: 1,
    verticalAlign: "middle"
  },
  caretDown: {
    "&::before": {
      content: "'\f105'"
    }
  },
  caretUp: {
    "&::before": {
      content: "'\f106'"
    }
  },
  checkmark: {
    "&::before": {
      content: "'\f101'"
    }
  },
  chevron: {
    "&::before": {
      content: "'\f107'"
    }
  },
  leftChevron: {
    "&::before": {
      content: "'\f107'",
      display: "inline-block",
      transform: "rotate(-180deg) translateY(1.5px)"
    }
  },
  exclamationPointCircle: {
    "&::before": {
      content: "'\f103'"
    }
  },
  expander: {
    "&::before": {
      content: "'\f113'"
    }
  },
  hamburger: {
    "&::before": {
      content: "'\f112'"
    }
  },
  location: {
    "&::before": {
      content: "'\f110'"
    }
  },
  minus: {
    "&::before": {
      content: "'\f109'"
    }
  },
  plus: {
    "&::before": {
      content: "'\f108'"
    }
  },
  questionMarkCircle: {
    "&::before": {
      content: "'\f102'"
    }
  },
  spyglass: {
    "&::before": {
      content: "'\f111'"
    }
  },
  times: {
    "&::before": {
      content: "'\f104'"
    }
  }
};

const getColour$1 = variant => {
  switch (variant) {
    case "primary":
      return colorIconPrimary;
    case "secondary":
      return colorIconSecondary;
    case "inverted":
      return colorWhite;
    case "error":
      return colorCardinal;
    default:
      return undefined;
  }
};
const iconSymbol = ({
  symbol
}) => ({
  ...icons.default,
  ...icons[symbol]
});
const iconVariant = ({
  variant
}) => ({
  color: getColour$1(variant)
});
const iconSize = ({
  iSize
}) => ({
  fontSize: pixelToRem(iSize)
});
const StyledIcon$2 = styled.i(iconSymbol, iconVariant, iconSize);
const Icon = ({
  symbol,
  variant,
  size,
  ...rest
}) => /*#__PURE__*/React.createElement(StyledIcon$2, _extends$1({}, safeRest(rest), {
  symbol: symbol,
  variant: variant,
  iSize: size
}));
Icon.propTypes = {
  symbol: PropTypes.oneOf(["caretDown", "caretUp", "checkmark", "chevron", "leftChevron", "exclamationPointCircle", "expander", "hamburger", "location", "minus", "plus", "questionMarkCircle", "spyglass", "times"]).isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "inverted", "error"]),
  size: PropTypes.oneOf([16, 20, 24, 32, 48])
};
Icon.defaultProps = {
  variant: undefined,
  size: 24
};

const DecorativeIcon = ({
  symbol,
  variant,
  size,
  ...rest
}) => {
  return /*#__PURE__*/React.createElement(Icon, _extends$1({}, rest, {
    symbol: symbol,
    variant: variant,
    size: size,
    "aria-hidden": "true"
  }));
};
DecorativeIcon.propTypes = {
  symbol: PropTypes.oneOf(["caretDown", "caretUp", "checkmark", "chevron", "leftChevron", "exclamationPointCircle", "expander", "hamburger", "location", "minus", "plus", "questionMarkCircle", "spyglass", "times"]).isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "inverted", "error"]),
  size: PropTypes.oneOf([16, 20, 24, 32, 48])
};
DecorativeIcon.defaultProps = {
  variant: undefined,
  size: 24
};

const getColour = variant => {
  switch (variant) {
    case "alternative":
      return colorGreyShark;
    case "inverted":
      return colorWhite;
    case "default":
    default:
      return colorNemetonPurple;
  }
};
const svgVariant = ({
  variant
}) => ({
  "& > svg": {
    fill: getColour(variant)
  }
});
const svgSize = ({
  size
}) => ({
  "& > svg": {
    width: pixelToRem(size),
    height: pixelToRem(size)
  }
});
const StyledSVGIcon = styled.i({
  display: "inline-flex"
}, svgVariant, svgSize);
const SVGIcon = ({
  onClick,
  ...rest
}) => {
  if (onClick) {
    warn("SVGIcon", "SVG Icon is not interactive and does not accept events through props.");
  }
  return /*#__PURE__*/React.createElement(StyledSVGIcon, _extends$1({}, safeRest(rest), {
    "aria-hidden": "true"
  }));
};
SVGIcon.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(["default", "alternative", "inverted"]),
  size: PropTypes.oneOf([16, 20, 24, 32, 48])
};
SVGIcon.defaultProps = {
  variant: "default",
  size: 24,
  onClick: undefined
};

const Accessible = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M1.231 11.257l.662.662a5.87 5.87 0 00-.982 3.235c0 1.585.618 3.078 1.74 4.2a5.903 5.903 0 004.2 1.739 5.838 5.838 0 002.991-.831l.242-.151.647.645C9.564 21.566 8.214 22 6.851 22a6.83 6.83 0 01-4.845-2.003A6.805 6.805 0 010 15.154c0-1.416.438-2.76 1.232-3.897zm5.81-9.99c.223 0 .449.058.652.176 0 0 5.947 3.455 5.957 3.462.307.192.507.492.579.822.124.433.054.913-.22 1.3l-.1.125-2.68 2.738c.159.132.316.27.465.42l.014.015.014.016 5.136-.603.07-.002a1.3 1.3 0 011.3 1.265l-.004.14-.39 6.71a1.46 1.46 0 01-1.55 1.366 1.456 1.456 0 01-1.36-1.41l.002-.141.337-4.465a.09.09 0 00-.09-.103h-.013l-.012.004-1.684.297a6.859 6.859 0 01-.81 5.367l-.165.253-.66-.66a5.882 5.882 0 00.96-3.206 5.903 5.903 0 00-1.738-4.2 5.904 5.904 0 00-4.201-1.74c-1.06 0-2.073.291-2.966.813l-.24.148-.648-.648a6.827 6.827 0 012.94-1.156l.312-.035 2.507-2.778-1.5-.876L5.33 6.31a1.47 1.47 0 01-2.081.002c-.542-.542-.554-1.423-.078-2.008l.102-.112 2.902-2.596c.244-.217.552-.33.865-.33zm9.49 9.43l-.061.004-3.975.467c.223.338.41.701.576 1.073l.12.28 1.75-.308.077-.022.156-.004c.288 0 .562.125.754.34.15.174.236.392.246.617l-.003.137-.337 4.454a.541.541 0 00.136.389.536.536 0 00.287.171l.086.013c.289 0 .509-.18.567-.422l.015-.093.357-6.14c.095-.847-.407-.964-.75-.955zm-9.49-8.52a.387.387 0 00-.202.057l-.057.043L3.905 4.85c-.215.23-.222.607-.012.817a.558.558 0 00.725.057l.068-.058.027-.027.029-.024 1.924-1.63.49-.416.558.325 1.5.876.967.565-.75.832-1.913 2.12a6.959 6.959 0 012.683.85l.31.183 2.727-2.784a.603.603 0 00.135-.46l-.02-.1-.008-.026-.005-.027a.385.385 0 00-.165-.241c-.278-.163-5.044-2.93-5.83-3.388l-.063-.036-.047-.027a.38.38 0 00-.194-.053zM14.743 0c1.16 0 2.106.945 2.106 2.106a2.11 2.11 0 01-2.106 2.107 2.11 2.11 0 01-2.106-2.107C12.637.945 13.582 0 14.743 0zm0 .91a1.196 1.196 0 000 2.392 1.196 1.196 0 000-2.391z",
  fillRule: "evenodd"
})));
Accessible.displayName = "DecorativeIcon";

const AddUser = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M19,19 L19,20.5 C19,20.776 18.776,21 18.5,21 C18.224,21 18,20.776 18,20.5 L18,19 L16.5,19 C16.224,19 16,18.776 16,18.5 C16,18.224 16.224,18 16.5,18 L18,18 L18,16.5 C18,16.224 18.224,16 18.5,16 C18.776,16 19,16.224 19,16.5 L19,18 L20.5,18 C20.776,18 21,18.224 21,18.5 C21,18.776 20.776,19 20.5,19 L19,19 Z M13.605,24 L0.5,24 C0.224,24 0,23.776 0,23.5 L0,21.098 C0,21.057 0.005,21.016 0.015,20.977 C0.276,19.933 0.685,18.912 1.904,18.505 L6.342,17.026 C7.385,16.59 7.873,14.864 7.978,14.209 C7.213,13.506 6.5,12.449 6.5,11.5 C6.5,11.146 6.395,11 6.339,10.973 C6.183,10.934 6.095,10.835 6.035,10.686 C5.981,10.549 5.5,9.322 5.5,8.5 C5.5,8.459 5.505,8.418 5.515,8.379 C5.57,8.159 5.723,7.839 6,7.651 L6,5 C6,2.912 7.902,0 11,0 C14.06,0 14.892,1.569 14.99,2.345 C15.508,2.729 16,3.389 16,5 L16,7.651 C16.277,7.839 16.43,8.159 16.485,8.379 C16.495,8.418 16.5,8.459 16.5,8.5 C16.5,9.322 16.019,10.549 15.964,10.686 C15.904,10.835 15.776,10.947 15.621,10.986 C15.605,11 15.5,11.146 15.5,11.5 C15.5,11.935 15.352,12.412 15.061,12.92 C14.923,13.159 14.618,13.241 14.378,13.105 C14.139,12.967 14.056,12.662 14.193,12.422 C14.394,12.072 14.5,11.754 14.5,11.5 C14.5,10.753 14.809,10.339 15.101,10.143 C15.245,9.751 15.474,9.039 15.498,8.576 C15.481,8.537 15.457,8.496 15.441,8.482 C15.165,8.481 15,8.276 15,8 L15,5 C15,3.528 14.527,3.229 14.325,3.1 C14.204,3.022 14,2.894 13.97,2.619 C13.964,2.559 13.972,2.492 13.992,2.424 C13.921,2.027 13.321,1 11,1 C8.558,1 7,3.369 7,5 L7,8 C7,8.276 6.776,8.5 6.5,8.5 C6.524,8.5 6.515,8.534 6.502,8.572 C6.525,9.038 6.755,9.751 6.899,10.142 C7.191,10.338 7.5,10.753 7.5,11.5 C7.5,12.173 8.163,13.073 8.818,13.614 C8.934,13.71 9,13.851 9,14 C9,14.635 8.423,17.24 6.692,17.962 L2.22,19.454 C1.512,19.69 1.231,20.259 1,21.16 L1,23 L13.605,23 C13.881,23 14.105,23.224 14.105,23.5 C14.105,23.776 13.882,24 13.605,24 Z M18.5,24 C15.467,24 13,21.532 13,18.5 C13,15.468 15.467,13 18.5,13 C21.533,13 24,15.468 24,18.5 C24,21.532 21.533,24 18.5,24 Z M18.5,14 C16.019,14 14,16.019 14,18.5 C14,20.981 16.019,23 18.5,23 C20.981,23 23,20.981 23,18.5 C23,16.019 20.981,14 18.5,14 Z"
})));
AddUser.displayName = "DecorativeIcon";

const AlarmClock = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "23",
  viewBox: "0 0 24 23"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M12.51384,13.393472 L17.03544,17.134592 C17.1708,17.269952 17.24376,17.427392 17.24376,17.573312 C17.24376,17.683712 17.20152,17.784512 17.12184,17.863232 C17.03064,17.954432 16.8444,18.055232 16.72248,18.055232 C16.63512,18.055232 16.51608,18.055232 16.40184,17.941952 L11.68728,14.013632 C11.598,13.926272 11.48664,13.813952 11.48664,13.606592 L11.48664,8.097152 C11.48664,7.794752 11.69784,7.583552 12.00024,7.583552 C12.30264,7.583552 12.51384,7.794752 12.51384,8.097152 L12.51384,13.393472 Z M6.484368,3.211328 C6.845328,2.850368 6.831888,2.435648 6.698448,2.168768 C6.525648,1.739648 6.219408,1.526528 5.781648,1.526528 C5.478288,1.526528 5.280528,1.605248 5.079888,1.805888 L1.773648,5.112128 C1.572048,5.313728 1.494288,5.510528 1.494288,5.814848 C1.494288,6.251648 1.706448,6.557888 2.126928,6.725888 C2.403408,6.864128 2.818128,6.878528 3.178128,6.516608 L6.484368,3.211328 Z M7.204368,3.931328 L3.899088,7.237568 C3.515088,7.620608 3.023568,7.824128 2.476368,7.824128 C2.219088,7.824128 1.969488,7.740608 1.729488,7.659968 C0.935568,7.307648 0.467088,6.619328 0.467088,5.814848 C0.467088,5.267648 0.669648,4.775168 1.053648,4.391168 L4.359888,1.085888 C4.742928,0.702848 5.234448,0.500288 5.781648,0.500288 C6.586128,0.500288 7.274448,0.967808 7.623888,1.752128 C7.957968,2.504768 7.796688,3.339968 7.204368,3.931328 Z M17.307312,2.15984 C17.168112,2.43632 17.154672,2.84912 17.515632,3.21104 L20.821872,6.51728 C21.182832,6.87824 21.595632,6.8648 21.864432,6.7304 C22.157232,6.58352 22.505712,6.30608 22.505712,5.81456 C22.505712,5.51024 22.426992,5.31344 22.226352,5.11184 L18.921072,1.8056 C18.720432,1.60496 18.522672,1.52624 18.217392,1.52624 C17.780592,1.52624 17.474352,1.74032 17.307312,2.15984 Z M22.947312,4.39184 C23.319792,4.76336 23.532912,5.28272 23.532912,5.81456 C23.532912,6.61904 23.065392,7.30736 22.282032,7.65584 C22.030512,7.74032 21.780912,7.82384 21.524592,7.82384 C20.976432,7.82384 20.485872,7.62032 20.100912,7.23728 L16.794672,3.93104 C16.203312,3.33968 16.042992,2.50448 16.377072,1.75184 C16.725552,0.96752 17.412912,0.5 18.217392,0.5 C18.766512,0.5 19.257072,0.70256 19.642032,1.0856 L22.947312,4.39184 Z M12.000144,21.751328 C16.491984,21.751328 20.144784,18.097568 20.144784,13.606688 C20.144784,9.115808 16.491984,5.462048 12.000144,5.462048 C7.509264,5.462048 3.855504,9.115808 3.855504,13.606688 C3.855504,18.097568 7.509264,21.751328 12.000144,21.751328 Z M12.000144,4.434848 C17.057424,4.434848 21.171984,8.549408 21.171984,13.606688 C21.171984,18.663968 17.057424,22.778528 12.000144,22.778528 C6.942864,22.778528 2.828304,18.663968 2.828304,13.606688 C2.828304,8.549408 6.942864,4.434848 12.000144,4.434848 Z"
})));
AlarmClock.displayName = "DecorativeIcon";

const Ambulance = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "23",
  viewBox: "0 0 24 23"
}, /*#__PURE__*/React.createElement("path", {
  d: "M22.5,15.5c-0.3,0-0.5-0.2-0.5-0.5V8.2l-0.7-0.7H5.8L3,11.2V15c0,0.3-0.2,0.5-0.5,0.5S2,15.3,2,15v-4 c0-0.1,0-0.2,0.1-0.3l3-4c0.1-0.1,0.2-0.2,0.4-0.2h16c0.1,0,0.3,0.1,0.4,0.1l1,1C22.9,7.7,23,7.9,23,8v7 C23,15.3,22.8,15.5,22.5,15.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7.5,12.5h-3c-0.2,0-0.4-0.1-0.4-0.3c-0.1-0.2-0.1-0.4,0-0.5l2-3c0.1-0.1,0.2-0.2,0.4-0.2h1 C7.8,8.5,8,8.7,8,9v3C8,12.3,7.8,12.5,7.5,12.5z M5.4,11.5H7v-2H6.8L5.4,11.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22.5,17.5h-1c-0.3,0-0.5-0.2-0.5-0.5s0.2-0.5,0.5-0.5H22v-1H6.5c-0.1,0-0.2,0-0.2-0.1l-2-1 C4,14.3,3.9,14,4.1,13.8c0.1-0.2,0.4-0.3,0.7-0.2l1.9,0.9h15.9c0.3,0,0.5,0.2,0.5,0.5v2C23,17.3,22.8,17.5,22.5,17.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M2.5,17.5h-1C1.2,17.5,1,17.3,1,17v-2c0-0.3,0.2-0.5,0.5-0.5h1C2.8,14.5,3,14.7,3,15s-0.2,0.5-0.5,0.5H2v1 h0.5C2.8,16.5,3,16.7,3,17S2.8,17.5,2.5,17.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5,20.5c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S6.1,20.5,5,20.5z M5,17.5c-0.6,0-1,0.4-1,1s0.4,1,1,1 s1-0.4,1-1S5.6,17.5,5,17.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19,20.5c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S20.1,20.5,19,20.5z M19,17.5c-0.6,0-1,0.4-1,1s0.4,1,1,1 s1-0.4,1-1S19.6,17.5,19,17.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16.5,17.5h-9C7.2,17.5,7,17.3,7,17s0.2-0.5,0.5-0.5h9c0.3,0,0.5,0.2,0.5,0.5S16.8,17.5,16.5,17.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M18.5,13.5c-0.3,0-0.5-0.2-0.5-0.5V9c0-0.3,0.2-0.5,0.5-0.5S19,8.7,19,9v4C19,13.3,18.8,13.5,18.5,13.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20.2,12.5c-0.1,0-0.2,0-0.2-0.1l-3.5-2c-0.2-0.1-0.3-0.4-0.2-0.7c0.1-0.2,0.4-0.3,0.7-0.2l3.5,2 c0.2,0.1,0.3,0.4,0.2,0.7C20.6,12.4,20.4,12.5,20.2,12.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16.8,12.5c-0.2,0-0.3-0.1-0.4-0.2c-0.1-0.2-0.1-0.5,0.2-0.7l3.5-2c0.2-0.1,0.5-0.1,0.7,0.2 c0.1,0.2,0.1,0.5-0.2,0.7l-3.5,2C16.9,12.5,16.9,12.5,16.8,12.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14.5,12.5h-4c-0.3,0-0.5-0.2-0.5-0.5V9c0-0.3,0.2-0.5,0.5-0.5h4C14.8,8.5,15,8.7,15,9v3 C15,12.3,14.8,12.5,14.5,12.5z M11,11.5h3v-2h-3V11.5z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M11.5,7.5h-2C9.2,7.5,9,7.3,9,7V5c0-0.8,0.7-1.5,1.5-1.5S12,4.2,12,5v2C12,7.3,11.8,7.5,11.5,7.5z M10,6.5h1 V5c0-0.3-0.2-0.5-0.5-0.5S10,4.7,10,5V6.5z"
})));
Ambulance.displayName = "DecorativeIcon";

const AppleWatch = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  fill: "#fff",
  d: "M17 19.7143H6.71429C5.768 19.7143 5 18.9463 5 18V6.85711C5 5.91082 5.768 5.14282 6.71429 5.14282H17C17.9463 5.14282 18.7143 5.91082 18.7143 6.85711V18C18.7143 18.9463 17.9463 19.7143 17 19.7143Z",
  stroke: "#4B286D",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M7 5L7.61865 1H16.3814L17 5",
  fill: "#fff",
  stroke: "#4B286D",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M17 20L16.5217 23H7.47924L7 20",
  fill: "#fff",
  stroke: "#4B286D",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.5703 8.57153V10.2858",
  fill: "#fff",
  stroke: "#4B286D",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.5703 13.7144V15.4286",
  fill: "#fff",
  stroke: "#4B286D",
  strokeLinecap: "round",
  strokeLinejoin: "round"
})));
AppleWatch.displayName = "DecorativeIcon";

const ArrowDown = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "24",
  viewBox: "0 0 20 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-2)",
  d: "M21.353125,14.853 L12.353125,23.853 C12.307125,23.899 12.251125,23.936 12.190125,23.961 C12.155125,23.976 12.119125,23.977 12.082125,23.983 C12.054125,23.988 12.029125,24 11.999125,24 C11.961125,24 11.928125,23.986 11.892125,23.978 C11.865125,23.972 11.837125,23.973 11.811125,23.962 C11.748125,23.936 11.691125,23.898 11.644125,23.851 L2.646125,14.853 C2.452125,14.658 2.452125,14.341 2.646125,14.146 C2.841125,13.951 3.159125,13.951 3.353125,14.146 L11.499125,22.293 L11.499125,0.5 C11.499125,0.224 11.724125,0 11.999125,0 C12.275125,0 12.499125,0.224 12.499125,0.5 L12.499125,22.293 L20.646125,14.146 C20.744125,14.049 20.872125,14 20.999125,14 C21.127125,14 21.255125,14.049 21.353125,14.146 C21.548125,14.341 21.548125,14.658 21.353125,14.853 Z"
})));
ArrowDown.displayName = "DecorativeIcon";

const ArrowUp = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "24",
  viewBox: "0 0 20 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-2)",
  d: "M21.353125,9.147 L12.353125,0.147 L12.353125,0.147 C12.307125,0.101 12.251125,0.064 12.190125,0.039 C12.155125,0.024 12.119125,0.023 12.082125,0.017 C12.054125,0.012 12.029125,0 11.999125,0 C11.961125,0 11.928125,0.014 11.892125,0.022 C11.865125,0.028 11.837125,0.027 11.811125,0.038 C11.748125,0.064 11.691125,0.102 11.644125,0.149 L2.646125,9.147 C2.452125,9.342 2.452125,9.659 2.646125,9.854 C2.841125,10.049 3.159125,10.049 3.353125,9.854 L11.499125,1.707 L11.499125,23.5 C11.499125,23.776 11.724125,24 11.999125,24 C12.275125,24 12.499125,23.776 12.499125,23.5 L12.499125,1.707 L20.646125,9.854 C20.744125,9.951 20.872125,10 20.999125,10 C21.127125,10 21.255125,9.951 21.353125,9.854 C21.548125,9.659 21.548125,9.342 21.353125,9.147"
})));
ArrowUp.displayName = "DecorativeIcon";

const ArtificialIntelligence = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "21",
  height: "24",
  viewBox: "0 0 21 24"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(-1)",
  d: "M7.5,7.48783227 C6.948,7.48783227 6.5,7.04055909 6.5,6.48945464 C6.5,5.93835018 6.948,5.491077 7.5,5.491077 C8.052,5.491077 8.5,5.93835018 8.5,6.48945464 C8.5,7.04055909 8.052,7.48783227 7.5,7.48783227 Z M7.5,6.48845626 L8,6.48945464 L7.5,6.48845626 Z M14.5,12.9789093 L12.5,12.9789093 C12.367,12.9789093 12.24,12.9259953 12.146,12.8331461 L11.146,11.8347685 C10.951,11.6400849 10.951,11.3235992 11.146,11.1289155 C11.341,10.9342319 11.658,10.9342319 11.853,11.1289155 L12.707,11.9805316 L14.293,11.9805316 L15.147,11.1279171 C15.342,10.9332335 15.659,10.9332335 15.854,11.1279171 C16.049,11.3226008 16.049,11.6390865 15.854,11.8337701 L14.854,12.8321478 C14.76,12.9259953 14.633,12.9789093 14.5,12.9789093 Z M12.5,20.9659304 C12.372,20.9659304 12.244,20.9170099 12.146,20.8201672 L11.146,19.8217896 C11.053,19.7279421 11,19.6011481 11,19.4683639 L11,15.4748534 C11,15.3420691 11.053,15.2152752 11.146,15.1214277 L12.146,14.12305 C12.341,13.9283664 12.658,13.9283664 12.853,14.12305 C13.048,14.3177337 13.048,14.6342194 12.853,14.828903 L12,15.6815175 L12,19.2616997 L12.854,20.1143142 C13.049,20.3089979 13.049,20.6254836 12.854,20.8201672 C12.756,20.9170099 12.628,20.9659304 12.5,20.9659304 Z M13.5,18.9691751 C13.224,18.9691751 13,18.7455385 13,18.4699863 L13,16.473231 C13,16.3404468 13.053,16.2136528 13.146,16.1198053 L17.146,12.1262948 C17.341,11.9316111 17.658,11.9316111 17.853,12.1262948 C18.048,12.3209784 18.048,12.6374641 17.853,12.8321478 L14,16.6798952 L14,18.4699863 C14,18.7455385 13.776,18.9691751 13.5,18.9691751 Z M12.5,21.4651192 C11.948,21.4651192 11.5,21.017846 11.5,20.4667415 C11.5,19.9156371 11.948,19.4683639 12.5,19.4683639 C13.052,19.4683639 13.5,19.9156371 13.5,20.4667415 C13.5,21.017846 13.052,21.4651192 12.5,21.4651192 Z M12.5,20.4657432 L13,20.4667415 L12.5,20.4657432 Z M15.5,19.9675527 C15.224,19.9675527 15,19.7439161 15,19.4683639 L15,17.4716086 C15,17.3388244 15.053,17.2120305 15.146,17.118183 L16.146,16.1198053 C16.341,15.9251217 16.658,15.9251217 16.853,16.1198053 C17.048,16.314489 17.048,16.6309747 16.853,16.8256583 L16,17.6782728 L16,19.4683639 C16,19.7439161 15.776,19.9675527 15.5,19.9675527 Z M14.5,5.491077 C13.948,5.491077 13.5,5.04380382 13.5,4.49269936 C13.5,3.94159491 13.948,3.49432173 14.5,3.49432173 C15.052,3.49432173 15.5,3.94159491 15.5,4.49269936 C15.5,5.04380382 15.052,5.491077 14.5,5.491077 Z M19.5103002,17.5695678 C19.4790183,17.411616 19.5245849,17.2413979 19.647,17.1191813 L19.928,16.8386372 L19.526,15.6335954 C19.481,15.4988144 19.497,15.3510545 19.567,15.2272557 C19.638,15.1044553 19.758,15.016598 19.898,14.9876451 C20.438,14.87383 20.956,14.6072632 21.002,14.4694871 C20.965,14.0771247 19.856,11.9615625 18.85,10.2363659 C18.786,10.1245476 18.766,9.99076501 18.797,9.86496942 C18.798,9.85498565 19,9.01535006 19,7.48783227 C19,6.11406464 16.874,0.998377636 10.5,0.998377636 C4.078,0.998377636 2,6.04317983 2,8.48620991 C2,10.7115937 3.4,13.1356546 4.525,15.0834893 C5.35,16.510171 6,17.6373393 6,18.4699863 C6,20.3579184 3.188,23.4538874 2.867,23.8003245 C2.769,23.9071509 2.635,23.9610633 2.5,23.9610633 C2.379,23.9610633 2.257,23.9171347 2.161,23.828279 C1.958,23.6415824 1.945,23.3260951 2.133,23.1234244 C2.93,22.2598278 5,19.740921 5,18.4699863 C5,17.9049045 4.349,16.7767378 3.659,15.5816798 C2.475,13.5320105 1,10.9781605 1,8.48620991 C1,4.96293523 3.947,0 10.5,0 C17.174,0 20,5.35629602 20,7.48783227 C20,8.71783352 19.878,9.53949832 19.81,9.89891426 C20.539,11.1578685 22,13.768626 22,14.4764757 C22,15.2082865 21.215,15.6156246 20.641,15.8143018 L20.975,16.8146762 C21.035,16.9943841 20.988,17.1920629 20.854,17.3258455 L20.4419017,17.7372752 C20.4881899,17.8247622 20.5091046,17.9268756 20.496,18.0326969 C20.462,18.3072507 20.206,18.4999376 19.937,18.4659928 C20,18.5578435 20.019,18.5947835 20.121,18.7455385 C20.271,18.9701735 20.5,19.3096219 20.5,19.9675527 C20.5,21.4810932 18.812,21.7566455 17.581,21.9573194 C15.938,22.2258829 14.163,23.1833271 13.986,23.5397479 C13.986,23.8153001 13.77,24 13.493,24 C13.217,24 13,23.7374267 13,23.4618745 C13,22.2957694 16.098,21.1885686 17.419,20.972919 C19.351,20.6564333 19.5,20.35692 19.5,19.9675527 C19.5,19.614127 19.412,19.4833396 19.29,19.3016348 C19.168,19.1189317 19,18.8693373 19,18.4699863 C19,18.064645 19.172,17.8270311 19.315,17.7002371 C19.3781125,17.6445538 19.4443464,17.6019944 19.5103002,17.5695678 Z M9.5,23.9610633 C9.224,23.9610633 9,23.7374267 9,23.4618745 L9,12.6863846 L6.146,9.83801323 C6.053,9.74416573 6,9.61737177 6,9.48458755 L6,7.48783227 C6,7.35504805 6.053,7.22825409 6.146,7.13440659 L7.146,6.13602895 C7.341,5.94134531 7.658,5.94134531 7.853,6.13602895 C8.048,6.33071259 8.048,6.6471983 7.853,6.84188194 L7,7.69449644 L7,9.27792337 L9.854,12.1272931 C9.947,12.2201423 10,12.3469362 10,12.4797205 L10,23.4618745 C10,23.7374267 9.776,23.9610633 9.5,23.9610633 Z M16.5,9.98377636 L9.5,9.98377636 C9.367,9.98377636 9.24,9.93086235 9.146,9.83801323 L8.146,8.83963559 C7.951,8.64495195 7.951,8.32846624 8.146,8.1337826 C8.341,7.93909896 8.658,7.93909896 8.853,8.1337826 L9.707,8.98539873 L16.5,8.98539873 C16.776,8.98539873 17,9.20903532 17,9.48458755 C17,9.76013977 16.776,9.98377636 16.5,9.98377636 Z M15.5,7.98702109 L12.5,7.98702109 C12.224,7.98702109 12,7.7633845 12,7.48783227 C12,7.21228004 12.224,6.98864345 12.5,6.98864345 L15.293,6.98864345 L16.147,6.13602895 C16.342,5.94134531 16.659,5.94134531 16.854,6.13602895 C17.049,6.33071259 17.049,6.6471983 16.854,6.84188194 L15.854,7.84025958 C15.76,7.93410708 15.633,7.98702109 15.5,7.98702109 Z M10.5,6.98864345 C10.372,6.98864345 10.244,6.93972295 10.146,6.84288032 C9.951,6.64819668 9.951,6.33171097 10.146,6.13702733 L11.146,5.13864969 C11.24,5.0448022 11.367,4.99188818 11.5,4.99188818 L13.293,4.99188818 L14.147,4.13927368 C14.342,3.94459004 14.659,3.94459004 14.854,4.13927368 C15.049,4.33395732 15.049,4.65044303 14.854,4.84512667 L13.854,5.84350431 C13.76,5.9373518 13.633,5.99026582 13.5,5.99026582 L11.707,5.99026582 L10.853,6.84288032 C10.756,6.93972295 10.628,6.98864345 10.5,6.98864345 Z M7.5,23.9610633 C7.224,23.9610633 7,23.7374267 7,23.4618745 L7,13.6847623 L4.146,10.8353925 C4.053,10.7425434 4,10.6157494 4,10.4829652 L4,5.491077 C4,5.35829277 4.053,5.23149881 4.146,5.13765132 L6.146,3.14089604 C6.24,3.04804692 6.367,2.99513291 6.5,2.99513291 L8.5,2.99513291 C8.633,2.99513291 8.76,3.04804692 8.854,3.14089604 L9.854,4.13927368 C10.049,4.33395732 10.049,4.65044303 9.854,4.84512667 C9.659,5.03981031 9.342,5.03981031 9.147,4.84512667 L8.293,3.99351055 L6.707,3.99351055 L5,5.69774117 L5,10.276301 L7.854,13.1256708 C7.947,13.2185199 8,13.3453139 8,13.4780981 L8,23.4618745 C8,23.7374267 7.776,23.9610633 7.5,23.9610633 Z"
})));
ArtificialIntelligence.displayName = "DecorativeIcon";

const Attention = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M10.6206024,6.61159154 C10.2686411,7.00054884 10.0976598,7.52149165 10.1496541,8.04243446 L11.0005607,16.5495006 C11.0265579,16.8054725 11.2415343,16.9994512 11.4985061,16.9994512 L12.4983963,16.9994512 C12.7553681,16.9994512 12.9703445,16.8054725 12.9953417,16.5495006 L13.8462483,8.04243446 C13.8982426,7.52149165 13.7272614,7.00054884 13.3753,6.61159154 C12.6723772,5.83467683 11.3235253,5.83467683 10.6206024,6.61159154 Z M12.0464459,15.9995609 L11.9514563,15.9995609 L11.1475446,7.94244544 C11.1225473,7.69847223 11.1995389,7.46449791 11.3645208,7.28251789 C11.6934847,6.91955774 12.3064174,6.91955774 12.6353813,7.28251789 C12.7993632,7.46349802 12.8763548,7.69847223 12.8523574,7.94244544 L12.0464459,15.9995609 Z M23.5841793,17.8603566 L15.0711139,2.82500724 C14.4481822,1.68313259 13.2993084,1.00120746 11.9984512,1.00120746 C10.697594,1.00120746 9.54872011,1.68313259 8.90779047,2.86300307 L0.421722077,17.8423586 C-0.165213489,18.9332389 -0.138216453,20.2190977 0.494714064,21.2859806 C1.13164414,22.3578629 2.25652065,22.9987925 3.50438366,22.9987925 L20.4935186,22.9987925 C21.7403817,22.9987925 22.8662581,22.3578629 23.5021883,21.2859806 C24.1391184,20.2130984 24.1631157,18.9182405 23.5841793,17.8603566 Z M22.6422827,20.7760366 C22.1873326,21.5429524 21.3834209,21.9999022 20.4925187,21.9999022 L3.50338377,21.9999022 C2.61248157,21.9999022 1.80856983,21.5429524 1.35361977,20.7760366 C0.898669717,20.0091208 0.881671583,19.0842223 1.30862471,18.3023081 C1.31562394,18.2903094 1.32162328,18.2783108 1.32762263,18.2653122 L9.80369212,3.30395466 C10.2486433,2.48804423 11.0695531,2.00109769 11.9984512,2.00109769 C12.9273492,2.00109769 13.7482591,2.48804423 14.1742123,3.26695872 L22.6872777,18.3023081 C23.1142309,19.0852222 23.0972327,20.0091208 22.6422827,20.7760366 Z M11.9984512,17.9993414 C11.171542,17.9993414 10.4986158,18.6722675 10.4986158,19.4991767 C10.4986158,20.326086 11.171542,20.9990121 11.9984512,20.9990121 C12.8253604,20.9990121 13.4982865,20.326086 13.4982865,19.4991767 C13.4982865,18.6722675 12.8253604,17.9993414 11.9984512,17.9993414 Z M11.9984512,19.9991218 C11.7224815,19.9991218 11.4985061,19.7741465 11.4985061,19.4991767 C11.4985061,19.2242069 11.7224815,18.9992316 11.9984512,18.9992316 C12.2744209,18.9992316 12.4983963,19.2242069 12.4983963,19.4991767 C12.4983963,19.7741465 12.2744209,19.9991218 11.9984512,19.9991218 Z"
})));
Attention.displayName = "DecorativeIcon";

const AutomaticFallDetection = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M13.2415 17.7419L13.9259 14.665C13.9708 14.4632 14.1483 14.3431 14.3224 14.3968C14.4965 14.4505 14.6012 14.6576 14.5563 14.8594L13.5617 19.3311L13.4172 19.9807L13.0133 19.4957L10.2332 16.1571C10.1077 16.0064 10.1104 15.7671 10.2391 15.6225C10.3679 15.4779 10.574 15.4828 10.6995 15.6335L12.6124 17.9307L12.0397 15.4258L11.2009 11.7566L4.92397 13.7279L4.60684 13.8275L4.52221 13.4573L2.01102 2.47261C1.9648 2.27041 2.06817 2.06422 2.24189 2.01207C2.41563 1.95992 2.59394 2.08156 2.64016 2.28376L5.06671 12.8983L11.3437 10.9269L11.6609 10.8273L11.7455 11.1975L12.6689 15.2369L13.2415 17.7419Z",
  fill: "#4B286D",
  stroke: "#4B286D",
  strokeWidth: "0.25"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15.0273 20.3447L16.3323 16.9084",
  stroke: "#4B286D",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9.63672 20.3447L13.1146 21.4356",
  stroke: "#4B286D",
  strokeLinecap: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15.0273 21.8612L21.1149 19.675",
  stroke: "#4B286D",
  strokeLinecap: "round"
})));
AutomaticFallDetection.displayName = "DecorativeIcon";

const Award = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "24",
  viewBox: "0 0 22 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1)",
  d: "M7.04936881,2.0728 C7.25236881,5.4018 8.09336881,13.5788 11.5133688,17.6028 C11.6983688,17.8208 11.6733688,18.1488 11.4543688,18.3348 C11.3583688,18.4158 11.2383688,18.4578 11.1173688,18.4578 C10.9653688,18.4578 10.8213688,18.3918 10.7213688,18.2748 C7.10036881,14.0128 6.22136881,5.5678 6.01136881,2.1358 C6.00336881,1.9968 6.04936881,1.8628 6.14136881,1.7588 C6.23436881,1.6548 6.36136881,1.5938 6.49936881,1.5848 C6.78036881,1.5848 7.03136881,1.7898 7.04936881,2.0728 Z M21.2182688,9.3823 C22.1342688,7.0623 21.8132688,4.1103 20.8972688,3.5143 C20.4572688,3.2223 19.8692688,3.6413 19.4462688,4.0563 C19.1782688,6.9223 18.5662688,11.0073 17.1592688,14.6023 C18.4902688,13.3683 20.4502688,11.3253 21.2182688,9.3823 Z M13.3662688,19.0023 C17.8552688,14.2183 18.5062688,3.4843 18.5962688,1.0393 L5.41126881,1.0393 C5.50226881,3.4833 6.15126881,14.2153 10.6422688,19.0023 L13.3662688,19.0023 Z M16.2362688,22.6543 C16.2362688,21.1583 14.6282688,20.0413 13.1922688,20.0413 L10.8162688,20.0413 C9.38026881,20.0413 7.77326881,21.1583 7.77326881,22.6543 L7.77326881,22.9613 L16.2362688,22.9613 L16.2362688,22.6543 Z M2.79026881,9.5303 C3.56026881,11.4793 5.53626881,13.4713 6.87226881,14.6653 C5.44826881,11.0503 4.83026881,6.9293 4.56226881,4.0373 C4.14726881,3.6333 3.57526881,3.2293 3.14126881,3.5133 C2.19426881,4.1303 1.85426881,7.1573 2.79026881,9.5303 Z M21.4632688,2.6433 C22.9082688,3.5833 23.2592688,7.0433 22.1842688,9.7633 C20.8062688,13.2523 16.2062688,16.7993 16.1602688,16.8353 L16.1302688,16.8543 C15.6502688,17.7523 15.1162688,18.5513 14.5442688,19.2363 C15.9312688,19.7103 17.2752688,20.9213 17.2752688,22.6543 L17.2752688,23.4803 C17.2752688,23.7673 17.0412688,24.0003 16.7542688,24.0003 L7.25426881,24.0003 C6.96726881,24.0003 6.73426881,23.7673 6.73426881,23.4803 L6.73426881,22.6553 C6.73426881,20.9233 8.07726881,19.7113 9.46526881,19.2363 C8.88626881,18.5453 8.34826881,17.7353 7.86326881,16.8283 L7.85826881,16.8253 C7.66726881,16.6843 3.18826881,13.3623 1.82426881,9.9123 C0.729268813,7.1373 1.09426881,3.6053 2.57526881,2.6433 C2.89826881,2.4323 3.55426881,2.1743 4.45226881,2.6663 C4.40626881,1.9813 4.38226881,1.4243 4.37026881,1.0393 L4.08726881,1.0393 C3.80026881,1.0393 3.56726881,0.8063 3.56726881,0.5193 C3.56726881,0.2333 3.80026881,0.0003 4.08726881,0.0003 L19.9212688,0.0003 C20.2082688,0.0003 20.4422688,0.2333 20.4422688,0.5193 C20.4422688,0.8063 20.2082688,1.0393 19.9212688,1.0393 L19.6382688,1.0393 C19.6282688,1.3733 19.6062688,1.9423 19.5562688,2.6803 C20.4722688,2.1703 21.1372688,2.4293 21.4632688,2.6433 Z"
})));
Award.displayName = "DecorativeIcon";

const Baby = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M19.2531253,11.3245841 C17.4385586,13.1381444 14.4887556,13.1381444 12.6762018,11.3245841 C10.8636479,9.51102389 10.8636479,6.56122086 12.6762018,4.74766062 C13.5829819,3.8408805 14.7735711,3.38799365 15.9641603,3.38799365 C17.1557559,3.38799365 18.3463451,3.8408805 19.2531253,4.74766062 C20.1317258,5.6252547 20.6158115,6.79370278 20.6158115,8.03561917 C20.6158115,9.27854197 20.1317258,10.4459836 19.2531253,11.3245841 M19.9646608,4.03612506 C17.7596051,1.83006288 14.169722,1.83006288 11.9646662,4.03612506 C9.75860401,6.24118082 9.75860401,9.83005752 11.9646662,12.0361197 C13.0676973,13.1391508 14.5159288,13.6906663 15.9641603,13.6906663 C17.4133982,13.6906663 18.8616297,13.1391508 19.9646608,12.0361197 C21.0334738,10.9683131 21.6222267,9.54725484 21.6222267,8.03561917 C21.6222267,6.52498991 21.0334738,5.10393161 19.9646608,4.03612506 M17.9675304,8.29104735 C18.3006539,8.30010509 18.6106298,8.43899039 18.8380796,8.68153646 C19.2919729,9.16059011 19.2919729,9.9133887 18.8380796,10.3934488 C18.7394509,10.4981159 18.6066041,10.551456 18.4727509,10.551456 C18.3489618,10.551456 18.2241663,10.5061673 18.1265441,10.4135771 C17.925261,10.2233646 17.9162033,9.90533738 18.1074222,9.70304792 C18.1949803,9.61045772 18.1949803,9.46553392 18.1074222,9.37294372 C18.044018,9.3055139 17.9655176,9.29444333 17.9323059,9.29746258 C17.8940621,9.29746258 17.8256259,9.30652032 17.7662474,9.36287957 C17.5659708,9.55309205 17.2449243,9.54403431 17.0557183,9.34174485 C16.8644994,9.1404618 16.8735571,8.82142818 17.0758466,8.63020928 C17.3173862,8.40175303 17.6243429,8.26890622 17.9675304,8.29104735 Z M15.4692053,10.0105078 C15.7469759,10.0105078 15.9724129,10.2359448 15.9724129,10.5137154 C15.9724129,10.791486 15.7469759,11.016923 15.4692053,11.016923 C14.8049712,11.016923 14.1809938,10.7582743 13.7120043,10.2892848 C13.2420084,9.81928887 12.9833597,9.19531143 12.9833597,8.53107738 C12.9833597,8.25330678 13.2087967,8.02786977 13.4865673,8.02786977 C13.7653443,8.02786977 13.9897749,8.25330678 13.9897749,8.53107738 C13.9897749,8.92659857 14.1447629,9.29796579 14.4235399,9.57774922 C14.7023169,9.85652624 15.0736841,10.0105078 15.4692053,10.0105078 Z M14.2986437,5.89296115 C14.0963543,6.08518646 13.7783271,6.07612872 13.5871082,5.87383926 C13.3968957,5.67255622 13.404947,5.35352259 13.6072365,5.1623037 C13.8477697,4.93284103 14.1597584,4.80401988 14.4969075,4.82213535 C14.830031,4.83119309 15.1400069,4.97007839 15.3684631,5.21262446 C15.8233628,5.69167811 15.8233628,6.4444767 15.3684631,6.92453676 C15.2698344,7.02920394 15.1369876,7.08254395 15.0031344,7.08254395 C14.8793453,7.08254395 14.7545498,7.03725526 14.6569276,6.94466506 C14.4556445,6.75445259 14.4465868,6.43642537 14.6378057,6.23413591 C14.7253638,6.14154571 14.7253638,5.99662192 14.6378057,5.90403172 C14.5744015,5.8366019 14.5240808,5.82251209 14.4626894,5.82855058 C14.4244456,5.82855058 14.3580222,5.83760831 14.2986437,5.89296115 Z M17.167531,16.775329 L20.9355496,13.0073104 C22.2469086,11.6989706 22.996688,9.88742319 22.9936687,8.03662558 C22.9936687,4.15991413 19.8405698,1.00681523 15.9648648,1.00681523 C15.9638584,1.00580881 15.9598327,1.00580881 15.9558071,1.00681523 C14.1080287,1.00681523 12.300507,1.75659457 10.99418,3.06392795 L7.13055193,6.92856242 L6.963487,8.10606823 C6.96147417,8.12217088 6.74207565,9.9608915 7.75251654,14.9225186 C12.4645526,16.6636169 16.8424589,16.7692905 16.8867411,16.7702969 L17.167531,16.775329 Z M13.006004,20.9358495 L16.1983531,17.7445069 C14.8437182,17.6549359 11.6040676,17.3228189 8.01317809,16.0859346 C8.69150195,18.8988651 9.63250019,21.0224013 10.8150381,22.4152799 C11.6282216,22.0650474 12.3759881,21.5678783 13.006004,20.9358495 Z M8.04236413,22.9949751 C8.6351427,22.9949751 9.22288919,22.9094298 9.79252021,22.7614868 C8.49927664,21.0898311 7.50091274,18.6221009 6.82158246,15.403585 C5.84938535,10.7257671 5.91178309,8.63544264 5.95304612,8.10506182 L3.06463442,10.9934735 C1.7351599,12.3209352 1.00349603,14.0861875 1.00651528,15.9631519 C1.00651528,19.8408698 4.15961418,22.9949751 8.03531922,22.9949751 L8.04236413,22.9949751 Z M24.000084,8.03561917 C24.0031032,10.151104 23.1456374,12.2233129 21.6470852,13.718846 L17.7361556,17.6287691 C17.7311235,17.6348076 17.725085,17.6408461 17.7180401,17.6468846 L13.7175396,21.6473851 C12.9285101,22.4384275 11.9754348,23.0442894 10.9418464,23.4468555 C10.875423,23.489125 10.8029611,23.5152918 10.72748,23.5233431 C9.86900776,23.8302997 8.96222764,24.0013903 8.04337054,24.0013903 L8.03531922,24.0013903 C3.60407298,24.0013903 0.000100051928,20.396411 0.000100051928,15.9641583 C-0.00291919375,13.8174746 0.833411859,11.7996121 2.35410527,10.281938 L10.2826444,2.3533988 C11.7751582,0.857865773 13.8423351,0.0004 15.9558071,0.0004 L15.9658712,0.0004 C20.396111,0.0004 24.000084,3.60537934 24.000084,8.03561917 Z"
})));
Baby.displayName = "DecorativeIcon";

const BabyBoy = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M15.1582,17.2159 C15.3402,16.9959 15.6672,16.9629 15.8872,17.1389 C16.1112,17.3199 16.1482,17.6389 15.9712,17.8629 C15.9272,17.9209 14.8492,19.2499 12.0002,19.2499 C9.1622,19.2499 8.0742,17.9209 8.0292,17.8639 C7.8522,17.6389 7.8922,17.3109 8.1162,17.1339 C8.3412,16.9579 8.6662,16.9979 8.8422,17.2169 C8.8492,17.2259 9.7062,18.2109 12.0002,18.2109 C14.2992,18.2109 15.1492,17.2269 15.1582,17.2159 Z M9.208,13.4991 C9.191,13.4771 8.74,12.9151 8.041,12.9151 C7.349,12.9151 6.889,13.4791 6.87,13.5031 C6.696,13.7281 6.37,13.7711 6.144,13.6011 C5.917,13.4291 5.871,13.1031 6.041,12.8751 C6.12,12.7721 6.838,11.8761 8.04,11.8761 C9.243,11.8761 9.961,12.7721 10.04,12.8751 C10.211,13.1041 10.165,13.4321 9.936,13.6031 C9.846,13.6711 9.738,13.7071 9.625,13.7071 C9.459,13.7071 9.308,13.6321 9.209,13.5001 L9.208,13.4991 Z M15.958,11.8765 C17.193,11.8765 17.927,12.8345 17.956,12.8755 C18.041,12.9865 18.075,13.1245 18.056,13.2615 C18.036,13.3975 17.964,13.5195 17.854,13.6025 C17.763,13.6705 17.655,13.7075 17.542,13.7075 C17.379,13.7075 17.224,13.6295 17.126,13.5005 C17.109,13.4775 16.656,12.9155 15.959,12.9155 C15.267,12.9155 14.807,13.4785 14.787,13.5025 C14.613,13.7275 14.287,13.7715 14.062,13.6005 C13.834,13.4285 13.788,13.1025 13.959,12.8755 C13.989,12.8345 14.723,11.8765 15.958,11.8765 Z M12,22.169 C16.434,22.169 20.152,18.982 20.844,14.593 C20.883,14.339 21.121,14.154 21.385,14.155 L21.469,14.164 L21.47,14.288 L21.47,14.164 C22.292,14.164 22.961,13.502 22.961,12.687 C22.961,11.871 22.298,11.207 21.483,11.207 C21.398,11.207 21.312,11.221 21.234,11.233 C20.978,11.277 20.719,11.116 20.647,10.856 C19.993,8.415 18.334,6.366 16.082,5.206 L16.082,6.062 C16.082,6.349 15.85,6.582 15.563,6.582 C15.276,6.582 15.044,6.349 15.044,6.062 L15.044,4.749 C14.599,4.587 14.149,4.461 13.707,4.374 L13.707,5.271 C13.707,5.557 13.474,5.79 13.187,5.79 C12.901,5.79 12.668,5.557 12.668,5.271 L12.668,4.232 C12.217,4.197 11.783,4.197 11.332,4.232 L11.332,5.271 C11.332,5.557 11.099,5.79 10.812,5.79 C10.525,5.79 10.292,5.557 10.292,5.271 L10.292,4.374 C9.848,4.461 9.399,4.587 8.957,4.749 L8.957,6.062 C8.957,6.349 8.724,6.582 8.437,6.582 C8.15,6.582 7.917,6.349 7.917,6.062 L7.917,5.206 C5.666,6.366 4.007,8.415 3.353,10.855 C3.283,11.117 3.027,11.281 2.763,11.232 C2.686,11.22 2.602,11.207 2.516,11.207 C1.702,11.207 1.039,11.871 1.039,12.687 C1.039,13.504 1.702,14.168 2.516,14.168 L2.611,14.155 L2.644,14.155 C2.901,14.155 3.117,14.34 3.157,14.593 C3.848,18.982 7.567,22.169 12,22.169 Z M23.248,10.896 C23.733,11.372 24,12.009 24,12.688 C24,13.954 23.038,15.035 21.793,15.189 C20.854,19.841 16.75,23.208 12,23.208 C7.249,23.208 3.146,19.841 2.208,15.189 C0.962,15.035 0,13.954 0,12.688 C0,12.013 0.27,11.376 0.76,10.896 C1.221,10.443 1.84,10.182 2.47,10.169 C3.328,7.447 5.306,5.225 7.917,4.049 L7.917,2.103 C7.917,1.816 8.15,1.584 8.437,1.584 C8.724,1.584 8.957,1.816 8.957,2.103 L8.957,3.647 C9.394,3.506 9.842,3.395 10.292,3.316 L10.292,1.312 C10.292,1.025 10.525,0.792 10.812,0.792 C11.099,0.792 11.332,1.025 11.332,1.312 L11.332,3.19 C11.78,3.161 12.22,3.161 12.668,3.19 L12.668,1.312 C12.668,1.025 12.901,0.792 13.187,0.792 C13.474,0.792 13.707,1.025 13.707,1.312 L13.707,3.316 C14.157,3.395 14.605,3.505 15.044,3.647 L15.044,2.103 C15.044,1.816 15.276,1.584 15.563,1.584 C15.85,1.584 16.082,1.816 16.082,2.103 L16.082,4.049 C18.693,5.224 20.672,7.447 21.529,10.17 C22.177,10.183 22.784,10.439 23.248,10.896 Z"
})));
BabyBoy.displayName = "DecorativeIcon";

const BabyGirl = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M9.2114,14.2939 C9.1624,14.2329 8.7114,13.7069 8.0414,13.7069 C7.3334,13.7069 6.8774,14.2869 6.8724,14.2929 C6.7004,14.5189 6.3734,14.5649 6.1454,14.3919 C5.9174,14.2199 5.8714,13.8959 6.0424,13.6669 C6.0724,13.6269 6.8064,12.6679 8.0414,12.6679 C9.2324,12.6679 9.9604,13.5629 10.0384,13.6649 C10.2124,13.8969 10.1654,14.2229 9.9364,14.3949 C9.8484,14.4629 9.7374,14.4989 9.6254,14.4989 C9.4614,14.4989 9.3114,14.4249 9.2114,14.2939 Z M15.1592,18.0068 C15.3422,17.7868 15.6682,17.7538 15.8882,17.9328 C16.1072,18.1088 16.1452,18.4338 15.9712,18.6558 C15.8572,18.7988 14.7822,20.0408 12.0002,20.0408 C9.1622,20.0408 8.0742,18.7118 8.0292,18.6558 C7.8522,18.4288 7.8912,18.1028 8.1162,17.9258 C8.3392,17.7528 8.6652,17.7878 8.8422,18.0088 C8.8492,18.0178 9.7062,19.0018 12.0002,19.0018 C14.3072,19.0018 15.1482,18.0198 15.1572,18.0088 L15.1612,18.0028 L15.1592,18.0068 Z M15.959,12.668 C17.193,12.668 17.927,13.627 17.956,13.667 C18.129,13.897 18.082,14.223 17.854,14.395 C17.763,14.464 17.655,14.499 17.542,14.499 C17.38,14.499 17.224,14.421 17.126,14.292 C17.079,14.233 16.63,13.707 15.959,13.707 C15.267,13.707 14.807,14.271 14.787,14.295 C14.616,14.521 14.29,14.564 14.063,14.392 C13.835,14.22 13.789,13.895 13.96,13.667 C13.99,13.627 14.724,12.668 15.959,12.668 Z M18.7168,3.6577 C18.8528,3.3197 19.0018,2.9457 19.0018,2.4987 C19.0018,1.8247 18.6108,1.0387 17.5068,1.0387 C16.5178,1.0387 15.4798,1.5507 14.7148,2.4117 C15.0918,3.0297 15.2908,3.7417 15.2908,4.4777 C15.2908,5.2147 15.0918,5.9277 14.7148,6.5447 C15.4808,7.4067 16.5188,7.9187 17.5068,7.9187 C18.6098,7.9187 19.0018,7.1637 19.0018,6.4587 C19.0018,6.0057 18.8508,5.6317 18.7168,5.3007 C18.5998,5.0087 18.4978,4.7567 18.4978,4.4787 C18.4978,4.2017 18.5998,3.9497 18.7168,3.6577 Z M11.9998,1.8307 C10.7588,1.8307 9.7488,3.0187 9.7488,4.4777 C9.7488,5.9377 10.7588,7.1257 11.9998,7.1257 C13.2418,7.1257 14.2518,5.9377 14.2518,4.4777 C14.2518,3.0187 13.2418,1.8307 11.9998,1.8307 Z M5.5028,4.4777 C5.5028,4.7577 5.3958,5.0207 5.2818,5.2997 C5.1488,5.6327 4.9978,6.0077 4.9978,6.4577 C4.9978,7.1317 5.3898,7.9177 6.4928,7.9177 C7.4838,7.9177 8.5208,7.4057 9.2848,6.5447 C8.9078,5.9257 8.7088,5.2137 8.7088,4.4777 C8.7088,3.7427 8.9078,3.0307 9.2848,2.4117 C8.5208,1.5507 7.4828,1.0387 6.4928,1.0387 C5.3908,1.0387 4.9978,1.7927 4.9978,2.4987 C4.9978,2.9467 5.1478,3.3197 5.2808,3.6497 L5.1688,3.7027 L5.2828,3.6567 C5.4018,3.9487 5.5038,4.2007 5.5028,4.4777 Z M11.9998,22.9607 C16.4338,22.9607 20.1528,19.7757 20.8448,15.3857 C20.8828,15.1407 21.1138,14.9487 21.3648,14.9487 L21.3878,14.9487 L21.4718,14.9567 C22.2928,14.9557 22.9608,14.2937 22.9618,13.4797 C22.9618,12.6637 22.2988,11.9997 21.4848,11.9997 C21.4048,11.9997 21.3248,12.0117 21.2358,12.0257 C20.9768,12.0707 20.7198,11.9097 20.6488,11.6487 C20.3478,10.5277 19.7988,9.4347 19.0598,8.4807 C18.6298,8.7967 18.1098,8.9567 17.5068,8.9567 C16.2758,8.9567 14.9888,8.3577 14.0418,7.3477 C13.4528,7.8757 12.7328,8.1647 11.9998,8.1647 C11.2568,8.1647 10.5528,7.8837 9.9588,7.3477 C9.0108,8.3577 7.7238,8.9567 6.4928,8.9567 C5.8908,8.9567 5.3698,8.7967 4.9428,8.4807 C4.2008,9.4377 3.6528,10.5307 3.3518,11.6487 C3.2818,11.9117 3.0258,12.0767 2.7618,12.0257 C2.6718,12.0107 2.5948,11.9997 2.5158,11.9997 C1.7018,11.9997 1.0388,12.6637 1.0388,13.4807 C1.0388,14.2967 1.7018,14.9607 2.5158,14.9607 L2.6028,14.9497 C2.6108,14.9497 2.6188,14.9497 2.6278,14.9497 C2.8908,14.9497 3.1168,15.1377 3.1558,15.3867 C3.8478,19.7757 7.5678,22.9607 11.9998,22.9607 Z M23.2468,11.6747 C23.7328,12.1507 23.9998,12.7917 23.9998,13.4787 C23.9998,14.7447 23.0368,15.8247 21.7918,15.9797 C20.8558,20.6327 16.7508,23.9997 11.9998,23.9997 C7.2488,23.9997 3.1458,20.6327 2.2078,15.9807 C0.9618,15.8257 -0.000200000001,14.7457 -0.000200000001,13.4797 C-0.000200000001,12.7997 0.2708,12.1607 0.7628,11.6797 C1.2298,11.2237 1.8328,10.9697 2.4708,10.9607 C2.8418,9.7887 3.4548,8.6567 4.2498,7.6747 C4.0588,7.3047 3.9588,6.8857 3.9588,6.4577 C3.9588,5.8037 4.1668,5.2877 4.3188,4.9107 C4.3728,4.7787 4.4628,4.5577 4.4628,4.4777 C4.4628,4.3977 4.3688,4.1687 4.3188,4.0467 C4.1668,3.6687 3.9588,3.1527 3.9588,2.4987 C3.9588,1.2947 4.7518,-0.0003 6.4928,-0.0003 C7.7238,-0.0003 9.0108,0.5987 9.9578,1.6087 C10.5528,1.0737 11.2558,0.7917 11.9998,0.7917 C12.7448,0.7917 13.4478,1.0737 14.0418,1.6087 C14.9888,0.5997 16.2758,0.0007 17.5068,0.0007 C19.2478,0.0007 20.0408,1.2957 20.0408,2.4997 C20.0408,3.1567 19.8248,3.6917 19.6818,4.0467 C19.6238,4.1887 19.5378,4.4027 19.5378,4.4787 C19.5378,4.5567 19.6238,4.7707 19.6818,4.9117 C19.8328,5.2887 20.0408,5.8057 20.0408,6.4577 C20.0408,6.8867 19.9408,7.3057 19.7498,7.6747 C20.5458,8.6587 21.1578,9.7907 21.5288,10.9597 C22.1788,10.9707 22.7858,11.2217 23.2468,11.6747 Z"
})));
BabyGirl.displayName = "DecorativeIcon";

const BackToSchool = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M10.788,15 C11.277,15 11.524,14.898 11.753,14.785 C11.852,14.736 11.897,14.714 11.999,14.707 C12.101,14.714 12.146,14.736 12.245,14.785 C12.475,14.898 12.721,15 13.21,15 C15.989,15 18,11.187 17.998,8.618 C17.998,6.143 16.843,4.408 15.068,4.071 C15.63,3.411 16,2.551 16,1.5 C16,1.224 15.776,1 15.5,1 C14.236,1 12.951,1.625 12.19,2.732 C11.992,2.142 11.718,1.703 11.422,1.234 C11.275,1 10.966,0.931 10.733,1.078 C10.499,1.225 10.43,1.534 10.577,1.767 C11.057,2.527 11.415,3.106 11.485,4.489 C11.39,4.455 11.296,4.422 11.191,4.381 C10.761,4.211 10.225,4 9.567,4 C7.433,4 5.998,5.856 5.998,8.618 C5.998,11.187 8.01,15 10.788,15 Z M14.957,2.048 C14.79,3.073 14.159,3.791 13.382,4.175 C13.173,4.24 12.978,4.313 12.804,4.381 C12.79,4.387 12.778,4.39 12.764,4.396 C12.69,4.415 12.618,4.438 12.543,4.451 C12.768,3.074 13.829,2.249 14.957,2.048 Z M9.57,5.001 C10.038,5.001 10.439,5.159 10.827,5.312 C11.196,5.457 11.577,5.607 11.991,5.607 L12.011,5.607 C12.425,5.607 12.806,5.458 13.175,5.312 C13.193,5.305 13.212,5.298 13.23,5.291 C13.354,5.251 13.476,5.209 13.597,5.157 C13.857,5.069 14.13,5.001 14.432,5.001 C15.968,5.001 17.001,6.455 17.001,8.619 C17.001,10.991 15.216,14.001 13.211,14.001 C12.916,14.001 12.82,13.954 12.689,13.889 C12.544,13.817 12.346,13.719 12.012,13.707 C11.983,13.704 11.957,13.706 11.932,13.71 C11.632,13.731 11.449,13.822 11.313,13.889 C11.182,13.954 11.086,14.001 10.791,14.001 C8.785,14.001 7.001,10.992 7.001,8.619 C7.001,6.455 8.033,5.001 9.57,5.001 Z M23.931,22.262 C23.912,22.227 23.892,22.193 23.865,22.164 C23.849,22.146 23.829,22.133 23.81,22.118 C23.782,22.095 23.753,22.074 23.72,22.057 C23.697,22.046 23.673,22.038 23.649,22.03 C23.63,22.024 23.613,22.013 23.593,22.009 C23.359,21.759 23,20.518 23,19.5 C23,18.482 23.359,17.241 23.593,16.991 C23.613,16.987 23.63,16.976 23.649,16.97 C23.674,16.962 23.697,16.955 23.72,16.943 C23.754,16.926 23.783,16.905 23.812,16.881 C23.83,16.866 23.849,16.854 23.865,16.836 C23.893,16.806 23.913,16.771 23.933,16.735 C23.943,16.717 23.955,16.703 23.963,16.684 C23.986,16.627 24,16.565 24,16.5 C24,16.224 23.776,16 23.5,16 L2.5,16 C1.122,16 0,17.122 0,18.5 L0,20.5 C0,21.878 1.122,23 2.5,23 L23.5,23 C23.776,23 24,22.776 24,22.5 C24,22.435 23.986,22.373 23.963,22.316 C23.955,22.296 23.942,22.28 23.931,22.262 Z M2.5,19 L22.029,19 C22.009,19.22 22,19.398 22,19.5 C22,19.602 22.009,19.78 22.029,20 L2.5,20 C2.224,20 2,20.224 2,20.5 C2,20.776 2.224,21 2.5,21 L22.177,21 C22.246,21.341 22.34,21.689 22.465,22 L2.5,22 C1.673,22 1,21.327 1,20.5 L1,18.5 C1,17.673 1.673,17 2.5,17 L22.464,17 C22.339,17.311 22.245,17.659 22.176,18 L2.5,18 C2.224,18 2,18.224 2,18.5 C2,18.776 2.224,19 2.5,19 Z"
})));
BackToSchool.displayName = "DecorativeIcon";

const Bank = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M0.536661466,8.04984424 L23.50078,8.04984424 C23.50078,8.04984424 23.50078,8.04984424 23.50078,8.04984424 C23.800312,8.04984424 24,7.85046729 24,7.55140187 C24,7.35202492 23.900156,7.15264798 23.700468,7.0529595 L12.8174727,0.0747663551 C12.6177847,-0.0249221184 12.4180967,-0.0249221184 12.3182527,0.0747663551 L0.336973479,7.0529595 C0.0374414977,7.25233645 -0.0624024961,7.4517134 0.0374414977,7.65109034 C0.137285491,7.85046729 0.336973479,8.04984424 0.536661466,8.04984424 Z M12.5179407,1.17133956 L21.8034321,7.0529595 L2.33385335,7.0529595 L12.5179407,1.17133956 Z M23.50078,20.0124611 L0.536661466,20.0124611 C0.237129485,20.0124611 0.0374414977,20.211838 0.0374414977,20.5109034 L0.0374414977,23.5015576 C0.0374414977,23.8006231 0.237129485,24 0.536661466,24 L23.50078,24 C23.800312,24 24,23.8006231 24,23.5015576 L24,20.5109034 C24,20.211838 23.800312,20.0124611 23.50078,20.0124611 Z M23.0015601,23.0031153 L1.03588144,23.0031153 L1.03588144,21.0093458 L23.0015601,21.0093458 L23.0015601,23.0031153 Z M7.52574103,10.0436137 C7.82527301,10.0436137 8.024961,9.84423676 8.024961,9.54517134 C8.024961,9.24610592 7.82527301,9.04672897 7.52574103,9.04672897 L6.52730109,9.04672897 L3.53198128,9.04672897 L2.53354134,9.04672897 C2.23400936,9.04672897 2.03432137,9.24610592 2.03432137,9.54517134 C2.03432137,9.84423676 2.23400936,10.0436137 2.53354134,10.0436137 L3.03276131,10.0436137 L3.03276131,18.0186916 L2.53354134,18.0186916 C2.23400936,18.0186916 2.03432137,18.2180685 2.03432137,18.517134 C2.03432137,18.8161994 2.23400936,19.0155763 2.53354134,19.0155763 L3.53198128,19.0155763 L6.52730109,19.0155763 L7.52574103,19.0155763 C7.82527301,19.0155763 8.024961,18.8161994 8.024961,18.517134 C8.024961,18.2180685 7.82527301,18.0186916 7.52574103,18.0186916 L7.02652106,18.0186916 L7.02652106,10.0436137 L7.52574103,10.0436137 Z M4.03120125,10.0436137 L6.02808112,10.0436137 L6.02808112,18.0186916 L4.03120125,18.0186916 L4.03120125,10.0436137 Z M14.5148206,10.0436137 C14.8143526,10.0436137 15.0140406,9.84423676 15.0140406,9.54517134 C15.0140406,9.24610592 14.8143526,9.04672897 14.5148206,9.04672897 L13.5163807,9.04672897 L10.5210608,9.04672897 L9.5226209,9.04672897 C9.22308892,9.04672897 9.02340094,9.24610592 9.02340094,9.54517134 C9.02340094,9.84423676 9.22308892,10.0436137 9.5226209,10.0436137 L10.0218409,10.0436137 L10.0218409,18.0186916 L9.5226209,18.0186916 C9.22308892,18.0186916 9.02340094,18.2180685 9.02340094,18.517134 C9.02340094,18.8161994 9.22308892,19.0155763 9.5226209,19.0155763 L10.5210608,19.0155763 L13.5163807,19.0155763 L14.5148206,19.0155763 C14.8143526,19.0155763 15.0140406,18.8161994 15.0140406,18.517134 C15.0140406,18.2180685 14.8143526,18.0186916 14.5148206,18.0186916 L14.0156006,18.0186916 L14.0156006,10.0436137 L14.5148206,10.0436137 Z M11.0202808,10.0436137 L13.0171607,10.0436137 L13.0171607,18.0186916 L11.0202808,18.0186916 L11.0202808,10.0436137 Z M21.5039002,10.0436137 C21.8034321,10.0436137 22.0031201,9.84423676 22.0031201,9.54517134 C22.0031201,9.24610592 21.8034321,9.04672897 21.5039002,9.04672897 L20.5054602,9.04672897 L17.5101404,9.04672897 L16.5117005,9.04672897 C16.2121685,9.04672897 16.0124805,9.24610592 16.0124805,9.54517134 C16.0124805,9.84423676 16.2121685,10.0436137 16.5117005,10.0436137 L17.0109204,10.0436137 L17.0109204,18.0186916 L16.5117005,18.0186916 C16.2121685,18.0186916 16.0124805,18.2180685 16.0124805,18.517134 C16.0124805,18.8161994 16.2121685,19.0155763 16.5117005,19.0155763 L17.5101404,19.0155763 L20.5054602,19.0155763 L21.5039002,19.0155763 C21.8034321,19.0155763 22.0031201,18.8161994 22.0031201,18.517134 C22.0031201,18.2180685 21.8034321,18.0186916 21.5039002,18.0186916 L21.0046802,18.0186916 L21.0046802,10.0436137 L21.5039002,10.0436137 Z M18.0093604,10.0436137 L20.0062402,10.0436137 L20.0062402,18.0186916 L18.0093604,18.0186916 L18.0093604,10.0436137 Z"
})));
Bank.displayName = "DecorativeIcon";

const BatteryCar = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M22.5 21h-21C.673 21 0 20.327 0 19.5v-13C0 5.673.673 5 1.5 5h4a.5.5 0 0 1 .447.276L6.309 6h11.383l.361-.724A.5.5 0 0 1 18.5 5h4c.827 0 1.5.673 1.5 1.5v13c0 .827-.673 1.5-1.5 1.5zM1.5 6a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h21a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-3.691l-.361.724A.503.503 0 0 1 18 7H6a.5.5 0 0 1-.447-.276L5.191 6H1.5zM6 14v1.5a.5.5 0 0 1-1 0V14H3.5a.5.5 0 0 1 0-1H5v-1.5a.5.5 0 0 1 1 0V13h1.5a.5.5 0 0 1 0 1H6zm9.5-7a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5v1a.5.5 0 0 1-1 0v-1C8 4.673 8.673 4 9.5 4h5c.827 0 1.5.673 1.5 1.5v1a.5.5 0 0 1-.5.5zm-11-1a.5.5 0 0 1-.5-.5V4H3v1.5a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5zm17 0a.5.5 0 0 1-.5-.5V4h-1v1.5a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5zm-1 8h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1z",
  fillRule: "nonzero"
})));
BatteryCar.displayName = "DecorativeIcon";

const BatteryCharging = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "13",
  height: "21",
  viewBox: "0 0 13 21"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-6 -2)",
  d: "M12.4997445,20.0003259 C12.4667445,20.0003259 12.4337445,19.9973259 12.3987445,19.9903259 C12.1667445,19.9423259 11.9997445,19.7373259 11.9997445,19.5003259 L11.9997445,15.0003259 L9.4997445,15.0003259 C9.3317445,15.0003259 9.1747445,14.9163259 9.0827445,14.7753259 C8.9897445,14.6343259 8.9747445,14.4573259 9.0397445,14.3033259 L12.0397445,7.30332587 C12.1337445,7.08532587 12.3597445,6.96232587 12.6007445,7.01032587 C12.8327445,7.05832587 12.9997445,7.26332587 12.9997445,7.50032587 L12.9997445,12.0003259 L15.4997445,12.0003259 C15.6677445,12.0003259 15.8247445,12.0843259 15.9167445,12.2253259 C16.0097445,12.3663259 16.0247445,12.5433259 15.9597445,12.6973259 L12.9597445,19.6973259 C12.8797445,19.8833259 12.6967445,20.0003259 12.4997445,20.0003259 Z M10.2577445,14.0003259 L12.4997445,14.0003259 C12.7757445,14.0003259 12.9997445,14.2243259 12.9997445,14.5003259 L12.9997445,17.0643259 L14.7417445,13.0003259 L12.4997445,13.0003259 C12.2237445,13.0003259 11.9997445,12.7763259 11.9997445,12.5003259 L11.9997445,9.93632587 L10.2577445,14.0003259 Z M16.5,23 L8.5,23 C7.121,23 6,21.878 6,20.5 L6,6.5 C6,5.122 7.121,4 8.5,4 L10,4 L10,2.5 C10,2.224 10.224,2 10.5,2 L14.5,2 C14.776,2 15,2.224 15,2.5 L15,4 L16.5,4 C17.879,4 19,5.122 19,6.5 L19,20.5 C19,21.878 17.879,23 16.5,23 Z M8.5,5 C7.673,5 7,5.673 7,6.5 L7,20.5 C7,21.327 7.673,22 8.5,22 L16.5,22 C17.327,22 18,21.327 18,20.5 L18,6.5 C18,5.673 17.327,5 16.5,5 L14.5,5 C14.224,5 14,4.776 14,4.5 L14,3 L11,3 L11,4.5 C11,4.776 10.776,5 10.5,5 L8.5,5 Z"
})));
BatteryCharging.displayName = "DecorativeIcon";

const Bell = props => {
  return /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "24",
    viewBox: "0 0 20 24"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    transform: "translate(-2)",
    d: "M9.55048897,21 L2.5,21 C2.32,21 2.153,20.903 2.064,20.746 C1.976,20.59 1.978,20.397 2.071,20.243 L3.789,17.381 C4.581,16.06 5,14.548 5,13.007 L5,10.5 C5,7.33564211 7.11197889,4.65406067 10,3.79119235 L10,2 C10,0.897 10.897,0 12,0 C13.103,0 14,0.897 14,2 L14,3.79119235 C16.8880211,4.65406067 19,7.33564211 19,10.5 L19,13.007 C19,14.548 19.419,16.06 20.211,17.381 L21.929,20.243 C22.022,20.397 22.024,20.59 21.936,20.746 C21.847,20.903 21.68,21 21.5,21 L14.451511,21 C14.4849288,21.1636443 14.502,21.3311656 14.502,21.5 C14.5,22.879 13.379,24 12,24 C10.621,24 9.5,22.879 9.5,21.5 C9.5,21.3311656 9.51707117,21.1636443 9.55048897,21 Z M10.5874,21 C10.5308928,21.1596088 10.501,21.3306464 10.501,21.5 C10.501,22.327 11.174,23 12.001,23 C12.828,23 13.501,22.327 13.501,21.5 C13.501,21.3306464 13.4711072,21.1596088 13.4146,21 L10.5874,21 Z M11,3.57125664 C11.3266789,3.52430187 11.6605619,3.5 12,3.5 C12.3394381,3.5 12.6733211,3.52430187 13,3.57125664 L13,2 C13,1.448 12.552,1 12,1 C11.448,1 11,1.448 11,2 L11,3.57125664 Z M3.383,20 L20.617,20 L19.353,17.895 C18.468,16.419 18,14.729 18,13.007 L18,10.5 C18,7.191 15.309,4.5 12,4.5 C8.691,4.5 6,7.191 6,10.5 L6,13.007 C6,14.729 5.532,16.419 4.646,17.895 L3.383,20 Z"
  })));
};
Bell.displayName = "DecorativeIcon";

const Bill = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "24",
  viewBox: "0 0 16 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-4)",
  d: "M15,18 C14.724,18 14.5,17.776 14.5,17.5 C14.5,17.224 14.724,17 15,17 L15,16.8658249 C14.7014196,16.6927755 14.5,16.3697147 14.5,16 C14.5,15.6302853 14.7014196,15.3072245 15,15.1341751 L15,15 C15,14.724 15.224,14.5 15.5,14.5 C15.776,14.5 16,14.724 16,15 C16.276,15 16.5,15.224 16.5,15.5 C16.5,15.776 16.276,16 16,16 L16,16.1341751 C16.2985804,16.3072245 16.5,16.6302853 16.5,17 C16.5,17.3697147 16.2985804,17.6927755 16,17.8658249 L16,18 C16,18.276 15.776,18.5 15.5,18.5 C15.224,18.5 15,18.276 15,18 Z M19,24 C18.903,24 18.806,23.972 18.723,23.916 L17.5,23.101 L16.277,23.916 C16.109,24.027 15.89,24.027 15.722,23.916 L14.5,23.101 L13.277,23.916 C13.109,24.027 12.89,24.027 12.722,23.916 L11.5,23.101 L10.277,23.916 C10.109,24.027 9.89,24.027 9.722,23.916 L8.5,23.101 L7.277,23.916 C7.124,24.018 6.926,24.028 6.764,23.94 C6.602,23.854 6.5,23.685 6.5,23.5 L6.5,10 L5,10 C4.724,10 4.5,9.776 4.5,9.5 L4.5,2.5 C4.5,1.121 5.622,0 7,0 L17.154,0 C18.447,0 19.5,1.121 19.5,2.5 L19.5,23.5 C19.5,23.685 19.398,23.854 19.236,23.94 C19.162,23.98 19.081,24 19,24 Z M14.5,22 C14.597,22 14.693,22.028 14.777,22.084 L16,22.899 L17.223,22.084 C17.391,21.973 17.61,21.973 17.778,22.084 L18.5,22.565 L18.5,2.5 C18.5,1.673 17.896,1 17.154,1 L7.002,1 C7.322,1.426 7.5,1.947 7.5,2.5 L7.5,22.565 L8.223,22.084 C8.391,21.973 8.61,21.973 8.778,22.084 L10,22.899 L11.223,22.084 C11.391,21.973 11.61,21.973 11.778,22.084 L13.001,22.899 L14.224,22.084 C14.307,22.028 14.403,22 14.5,22 Z M5.5,9 L6.5,9 L6.5,2.5 C6.5,2.066 6.317,1.664 6.001,1.382 C5.694,1.657 5.5,2.057 5.5,2.5 L5.5,9 Z M17,6 L9,6 C8.724,6 8.5,5.776 8.5,5.5 C8.5,5.224 8.724,5 9,5 L17,5 C17.276,5 17.5,5.224 17.5,5.5 C17.5,5.776 17.276,6 17,6 Z M17,9 L9,9 C8.724,9 8.5,8.776 8.5,8.5 C8.5,8.224 8.724,8 9,8 L17,8 C17.276,8 17.5,8.224 17.5,8.5 C17.5,8.776 17.276,9 17,9 Z M17,12 L9,12 C8.724,12 8.5,11.776 8.5,11.5 C8.5,11.224 8.724,11 9,11 L17,11 C17.276,11 17.5,11.224 17.5,11.5 C17.5,11.776 17.276,12 17,12 Z M17,20 L14,20 C13.724,20 13.5,19.776 13.5,19.5 C13.5,19.224 13.724,19 14,19 L17,19 C17.276,19 17.5,19.224 17.5,19.5 C17.5,19.776 17.276,20 17,20 Z"
})));
Bill.displayName = "DecorativeIcon";

const Bookmark = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M12.0001,11.4941 C12.0831,11.4941 12.1661,11.5151 12.2411,11.5561 L14.6651,12.8911 L14.1951,10.0241 C14.1691,9.8671 14.2201,9.7071 14.3301,9.5941 L16.3311,7.5391 L13.5831,7.1201 C13.4181,7.0951 13.2761,6.9891 13.2061,6.8381 L12.0011,4.2751 L10.8031,6.8381 C10.7321,6.9891 10.5901,7.0951 10.4251,7.1201 L7.6761,7.5391 L9.6781,9.5941 C9.7891,9.7071 9.8391,9.8671 9.8131,10.0241 L9.3431,12.8901 L11.7581,11.5561 C11.8331,11.5151 11.9171,11.4941 12.0001,11.4941 Z M15.3251,14.3261 C15.2421,14.3261 15.1591,14.3051 15.0841,14.2631 L12.0001,12.5651 L8.9251,14.2631 C8.7571,14.3561 8.5511,14.3461 8.3951,14.2341 C8.2381,14.1231 8.1591,13.9341 8.1891,13.7441 L8.7861,10.1111 L6.2821,7.5411 C6.1511,7.4071 6.1061,7.2101 6.1661,7.0331 C6.2251,6.8551 6.3791,6.7261 6.5641,6.6981 L10.0101,6.1721 L11.5471,2.8851 C11.6291,2.7091 11.8061,2.5971 12.0001,2.5971 C12.1941,2.5971 12.3701,2.7081 12.4531,2.8841 L13.9971,6.1721 L17.4431,6.6981 C17.6291,6.7261 17.7821,6.8551 17.8421,7.0331 C17.9011,7.2101 17.8571,7.4071 17.7271,7.5411 L15.2231,10.1111 L15.8181,13.7441 C15.8501,13.9341 15.7701,14.1231 15.6131,14.2341 C15.5271,14.2941 15.4271,14.3261 15.3251,14.3261 Z M5.319,1.105 C4.728,1.105 4.247,1.586 4.247,2.177 L4.247,22.417 C4.247,22.708 4.466,22.825 4.534,22.854 C4.6,22.882 4.835,22.963 5.046,22.761 L10.571,17.503 C11.372,16.736 12.628,16.735 13.432,17.505 L18.955,22.762 C19.163,22.962 19.398,22.882 19.463,22.854 C19.531,22.825 19.753,22.708 19.753,22.417 L19.753,2.177 C19.753,1.586 19.272,1.105 18.681,1.105 L5.319,1.105 Z M19.27,23.895 C18.902,23.895 18.545,23.754 18.264,23.485 L12.74,18.228 C12.325,17.828 11.677,17.83 11.262,18.226 L5.735,23.487 C5.3,23.899 4.688,24.007 4.139,23.773 C3.589,23.536 3.247,23.016 3.247,22.417 L3.247,2.177 C3.247,1.035 4.176,0.105 5.319,0.105 L18.681,0.105 C19.823,0.105 20.753,1.035 20.753,2.177 L20.753,22.417 C20.753,23.018 20.409,23.538 19.856,23.774 C19.663,23.856 19.465,23.895 19.27,23.895 Z"
})));
Bookmark.displayName = "DecorativeIcon";

const Briefcase = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M22.5,5 C23.327,5 24,5.673 24,6.5 L24,20.5 C24,21.327 23.327,22 22.5,22 L1.5,22 C0.673,22 0,21.327 0,20.5 L0,6.5 C0,5.673 0.673,5 1.5,5 L8,5 L8,3.5 C8,2.673 8.673,2 9.5,2 L14.5,2 C15.327,2 16,2.673 16,3.5 L16,5 L22.5,5 Z M22.5,21 C22.776,21 23,20.776 23,20.5 L23,12.147 L15.66,14.063 C14.463,14.374 13.231,14.53 12,14.53 C10.769,14.53 9.538,14.374 8.34,14.063 L1,12.147 L1,20.5 C1,20.776 1.224,21 1.5,21 L22.5,21 Z M1.5,6 C1.224,6 1,6.224 1,6.5 L1,11.114 L8.592,13.094 C10.821,13.676 13.178,13.676 15.407,13.094 L23,11.113 L23,6.5 C23,6.224 22.776,6 22.5,6 L15.5,6 L8.5,6 L1.5,6 Z M9,3.5 L9,5 L15,5 L15,3.5 C15,3.224 14.776,3 14.5,3 L9.5,3 C9.224,3 9,3.224 9,3.5 Z M12,9 C13.104,9 14,9.897 14,11 C14,12.103 13.104,13 12,13 C10.897,13 10,12.103 10,11 C10,9.897 10.897,9 12,9 Z M12,12 C12.551,12 13,11.551 13,11 C13,10.449 12.551,10 12,10 C11.449,10 11,10.449 11,11 C11,11.551 11.449,12 12,12 Z"
})));
Briefcase.displayName = "DecorativeIcon";

const Calendar = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M10.0172435,19.2416844 L8.43083844,19.2416844 C8.1549419,19.2416844 7.93102587,19.0177683 7.93102587,18.7418718 C7.93102587,18.4659753 8.1549419,18.2420592 8.43083844,18.2420592 L10.0172435,18.2420592 C10.616019,18.2420592 11.1038361,17.7552418 11.1038361,17.1554667 C11.1038361,16.5556916 10.616019,16.0688742 10.0172435,16.0688742 L9.2245408,16.0688742 C8.94764463,16.0688742 8.72472823,15.8459578 8.72472823,15.5690616 C8.72472823,15.2931651 8.94764463,15.069249 9.2245408,15.069249 L10.0172435,15.069249 C10.616019,15.069249 11.1038361,14.5824316 11.1038361,13.9826565 C11.1038361,13.383881 10.616019,12.896064 10.0172435,12.896064 L8.43083844,12.896064 C8.1549419,12.896064 7.93102587,12.6731476 7.93102587,12.3962514 C7.93102587,12.1203549 8.1549419,11.8964388 8.43083844,11.8964388 L10.0172435,11.8964388 C11.1678121,11.8964388 12.1034612,12.832088 12.1034612,13.9826565 C12.1034612,14.6174185 11.818568,15.1862052 11.370736,15.5690616 C11.818568,15.951918 12.1034612,16.5207047 12.1034612,17.1554667 C12.1034612,18.3050356 11.1678121,19.2416844 10.0172435,19.2416844 Z M15.5691616,19.2416844 C15.2922654,19.2416844 15.069349,19.0177683 15.069349,18.7418718 L15.069349,12.3962514 C15.069349,12.1203549 15.2922654,11.8964388 15.5691616,11.8964388 C15.8450581,11.8964388 16.0689741,12.1203549 16.0689741,12.3962514 L16.0689741,18.7418718 C16.0689741,19.0177683 15.8450581,19.2416844 15.5691616,19.2416844 Z M0.999625141,7.93102587 L23.0003749,7.93102587 L23.0003749,4.4653255 C23.0003749,3.86655004 22.5135574,3.37873298 21.9137823,3.37873298 L19.2417843,3.37873298 L19.2417843,5.25902786 C19.2417843,5.5349244 19.0178683,5.75884043 18.7419718,5.75884043 C18.4650756,5.75884043 18.2421592,5.5349244 18.2421592,5.25902786 L18.2421592,3.37873298 L6.55154317,3.37873298 L6.55154317,5.25902786 C6.55154317,5.5349244 6.32762714,5.75884043 6.0517306,5.75884043 C5.77483444,5.75884043 5.55191803,5.5349244 5.55191803,5.25902786 L5.55191803,3.37873298 L2.08521804,3.37873298 C1.48644258,3.37873298 0.999625141,3.86655004 0.999625141,4.4653255 L0.999625141,7.93102587 Z M0.999625141,8.93065101 L0.999625141,21.9137823 C0.999625141,22.5125578 1.48644258,23.0003749 2.08521804,23.0003749 L21.9137823,23.0003749 C22.5135574,23.0003749 23.0003749,22.5125578 23.0003749,21.9137823 L23.0003749,8.93065101 L0.999625141,8.93065101 Z M21.9137823,24 L2.08521804,24 C0.935649132,24 7.10542736e-15,23.0633512 7.10542736e-15,21.9137823 L7.10542736e-15,4.4653255 C7.10542736e-15,3.31475697 0.935649132,2.37910783 2.08521804,2.37910783 L5.55191803,2.37910783 L5.55191803,0.49981257 C5.55191803,0.223916031 5.77483444,-2.13162821e-14 6.0517306,-2.13162821e-14 C6.32762714,-2.13162821e-14 6.55154317,0.223916031 6.55154317,0.49981257 L6.55154317,2.37910783 L18.2421592,2.37910783 L18.2421592,0.49981257 C18.2421592,0.223916031 18.4650756,-2.13162821e-14 18.7419718,-2.13162821e-14 C19.0178683,-2.13162821e-14 19.2417843,0.223916031 19.2417843,0.49981257 L19.2417843,2.37910783 L21.9137823,2.37910783 C23.0643509,2.37910783 24,3.31475697 24,4.4653255 L24,21.9137823 C24,23.0633512 23.0643509,24 21.9137823,24 Z"
})));
Calendar.displayName = "DecorativeIcon";

const Call = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 22 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1 -1)",
  d: "M8.78581905,6.9099889 L7.20205393,9.84739195 C7.14517839,9.95326796 7.12855323,10.0722691 7.15567849,10.1833952 C7.99743653,13.6361781 10.669712,16.3084536 14.122495,17.1545867 C14.2327461,17.1948371 14.3578723,17.179087 14.4663733,17.1195864 L17.4046513,15.5349463 C17.9156562,15.2566936 18.5570374,15.3494445 18.9674163,15.7598234 L21.1881875,17.9814696 C21.4366898,18.2369721 21.5740662,18.5686002 21.5740662,18.9168535 C21.5740662,19.2703569 21.4375649,19.6019851 21.1890625,19.8504875 L19.8634248,21.1761251 C19.5991723,21.4412526 19.2202937,21.583879 18.8466651,21.5602538 C10.0799564,20.8191217 3.17964052,13.9223059 2.43763344,5.15997219 C2.40525813,4.78896865 2.5487595,4.40921502 2.82263712,4.14233747 L4.14827477,2.81582481 C4.39590214,2.56819744 4.7275303,2.43169614 5.0827837,2.43169614 C5.43016201,2.43169614 5.76179018,2.56907245 6.01641761,2.81582481 L8.55394184,5.34547396 C8.97132083,5.76372795 9.06494672,6.39198395 8.78581905,6.9099889 L8.78581905,6.9099889 Z M19.6227975,15.1131922 C18.9236659,14.4149356 17.8281554,14.253934 16.9575221,14.7211885 L14.1854956,16.2130777 C11.2218423,15.4246952 8.89869513,13.102423 8.10768758,10.1352697 L9.60045183,7.35624316 C10.0738314,6.4698597 9.91632985,5.39884947 9.20844809,4.69096771 L6.67092386,2.15344348 C5.82304076,1.30556039 4.33465155,1.3064354 3.48676846,2.15344348 L2.16813087,3.47295608 C1.69475135,3.94458559 1.4593741,4.57109157 1.50574954,5.23609792 C2.28450698,14.456936 9.54532631,21.7142553 18.7652893,22.4930127 C18.8204149,22.5008878 18.8746654,22.5008878 18.9297909,22.5008878 C19.5212966,22.5008878 20.1005521,22.2567604 20.5196811,21.8306314 L21.8383187,20.5119938 C22.2653228,20.0841147 22.499825,19.5179843 22.499825,18.9168535 C22.499825,18.3122228 22.2679478,17.7495924 21.8444437,17.3348384 L19.6227975,15.1131922 Z"
})));
Call.displayName = "DecorativeIcon";

const CallForward = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 22 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1 -1)",
  d: "M16.8620267,11.5017 C16.7520267,11.6117 16.5300267,11.6117 16.4200267,11.6117 C16.0890267,11.6117 15.8670267,11.3907 15.8670267,11.0597 C15.8670267,9.1807 14.4300267,7.7437 12.5510267,7.7437 C12.2200267,7.7437 11.9990267,7.5227 11.9990267,7.1907 C11.9990267,6.8597 12.2200267,6.6387 12.5510267,6.6387 C14.9830267,6.6387 16.9720267,8.6277 16.9720267,11.0597 C16.9720267,11.2807 16.8620267,11.3907 16.8620267,11.5017 Z M19.0720267,11.5017 C18.9620267,11.6117 18.7410267,11.6117 18.6310267,11.6117 C18.2990267,11.6117 18.0780267,11.3907 18.0780267,11.0597 C18.0780267,7.9647 15.6460267,5.5337 12.5510267,5.5337 C12.2200267,5.5337 11.9990267,5.3127 11.9990267,4.9807 C11.9990267,4.6487 12.2200267,4.4277 12.5510267,4.4277 C16.1990267,4.4277 19.1830267,7.4127 19.1830267,11.0597 C19.1830267,11.2807 19.0720267,11.3907 19.0720267,11.5017 Z M21.2830267,11.5017 C21.1730267,11.6117 20.9510267,11.6117 20.8410267,11.6117 C20.5090267,11.6117 20.2880267,11.3907 20.2880267,11.0597 C20.2880267,6.7487 16.8620267,3.3227 12.5510267,3.3227 C12.2200267,3.3227 11.9990267,3.1017 11.9990267,2.7707 C11.9990267,2.4387 12.2200267,2.2177 12.5510267,2.2177 C17.4150267,2.2177 21.3930267,6.1967 21.3930267,11.0597 C21.3930267,11.2807 21.2830267,11.3907 21.2830267,11.5017 Z M8.78581905,6.9099889 C9.06494672,6.39198395 8.97132083,5.76372795 8.55394184,5.34547396 L6.01641761,2.81582481 C5.76179018,2.56907245 5.43016201,2.43169614 5.0827837,2.43169614 C4.7275303,2.43169614 4.39590214,2.56819744 4.14827477,2.81582481 L2.82263712,4.14233747 C2.5487595,4.40921502 2.40525813,4.78896865 2.43763344,5.15997219 C3.17964052,13.9223059 10.0799564,20.8191217 18.8466651,21.5602538 C19.2202937,21.583879 19.5991723,21.4412526 19.8634248,21.1761251 L21.1890625,19.8504875 C21.4375649,19.6019851 21.5740662,19.2703569 21.5740662,18.9168535 C21.5740662,18.5686002 21.4366898,18.2369721 21.1881875,17.9814696 L18.9674163,15.7598234 C18.5570374,15.3494445 17.9156562,15.2566936 17.4046513,15.5349463 L14.4663733,17.1195864 C14.3578723,17.179087 14.2327461,17.1948371 14.122495,17.1545867 C10.669712,16.3084536 7.99743653,13.6361781 7.15567849,10.1833952 C7.12855323,10.0722691 7.14517839,9.95326796 7.20205393,9.84739195 L8.78581905,6.9099889 Z M19.6227975,15.1131922 L21.8444437,17.3348384 C22.2679478,17.7495924 22.499825,18.3122228 22.499825,18.9168535 C22.499825,19.5179843 22.2653228,20.0841147 21.8383187,20.5119938 L20.5196811,21.8306314 C20.1005521,22.2567604 19.5212966,22.5008878 18.9297909,22.5008878 C18.8746654,22.5008878 18.8204149,22.5008878 18.7652893,22.4930127 C9.54532631,21.7142553 2.28450698,14.456936 1.50574954,5.23609792 C1.4593741,4.57109157 1.69475135,3.94458559 2.16813087,3.47295608 L3.48676846,2.15344348 C4.33465155,1.3064354 5.82304076,1.30556039 6.67092386,2.15344348 L9.20844809,4.69096771 C9.91632985,5.39884947 10.0738314,6.4698597 9.60045183,7.35624316 L8.10768758,10.1352697 C8.89869513,13.102423 11.2218423,15.4246952 14.1854956,16.2130777 L16.9575221,14.7211885 C17.8281554,14.253934 18.9236659,14.4149356 19.6227975,15.1131922 Z"
})));
CallForward.displayName = "DecorativeIcon";

const CallOut = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 22 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1 -1)",
  d: "M22.4667497,1.77998992 C22.4921249,1.8517406 22.5,1.89724104 22.5,1.95061655 L22.5,7.69242137 C22.5,7.95404887 22.295248,8.15880082 22.0336205,8.15880082 C21.771118,8.15880082 21.5663661,7.9575489 21.5663661,7.69942144 L21.5663661,3.09337746 L14.4761734,10.1765701 C14.3991727,10.2631959 14.2784215,10.3156964 14.1489203,10.3156964 C14.020294,10.3156964 13.8995429,10.2631959 13.8181671,10.1730701 C13.7324163,10.0873192 13.6825408,9.97006812 13.6825408,9.84581693 C13.6825408,9.72244075 13.7324163,9.60431463 13.8225421,9.51506377 L20.9048598,2.43187114 L16.2996908,2.43187114 C16.0371883,2.43187114 15.8324363,2.22711919 15.8324363,1.96549169 C15.8324363,1.70386419 16.0371883,1.49911224 16.2996908,1.49911224 L22.0336205,1.49911224 C22.1097463,1.49911224 22.1613718,1.51136235 22.2164973,1.53848761 C22.2619977,1.55248774 22.3197483,1.5892381 22.3687487,1.63823856 C22.4124992,1.68286399 22.4404994,1.72748942 22.4667497,1.77998992 Z M8.78581905,6.9099889 C9.06494672,6.39198395 8.97132083,5.76372795 8.55394184,5.34547396 L6.01641761,2.81582481 C5.76179018,2.56907245 5.43016201,2.43169614 5.0827837,2.43169614 C4.7275303,2.43169614 4.39590214,2.56819744 4.14827477,2.81582481 L2.82263712,4.14233747 C2.5487595,4.40921502 2.40525813,4.78896865 2.43763344,5.15997219 C3.17964052,13.9223059 10.0799564,20.8191217 18.8466651,21.5602538 C19.2202937,21.583879 19.5991723,21.4412526 19.8634248,21.1761251 L21.1890625,19.8504875 C21.4375649,19.6019851 21.5740662,19.2703569 21.5740662,18.9168535 C21.5740662,18.5686002 21.4366898,18.2369721 21.1881875,17.9814696 L18.9674163,15.7598234 C18.5570374,15.3494445 17.9156562,15.2566936 17.4046513,15.5349463 L14.4663733,17.1195864 C14.3578723,17.179087 14.2327461,17.1948371 14.122495,17.1545867 C10.669712,16.3084536 7.99743653,13.6361781 7.15567849,10.1833952 C7.12855323,10.0722691 7.14517839,9.95326796 7.20205393,9.84739195 L8.78581905,6.9099889 Z M19.6227975,15.1131922 L21.8444437,17.3348384 C22.2679478,17.7495924 22.499825,18.3122228 22.499825,18.9168535 C22.499825,19.5179843 22.2653228,20.0841147 21.8383187,20.5119938 L20.5196811,21.8306314 C20.1005521,22.2567604 19.5212966,22.5008878 18.9297909,22.5008878 C18.8746654,22.5008878 18.8204149,22.5008878 18.7652893,22.4930127 C9.54532631,21.7142553 2.28450698,14.456936 1.50574954,5.23609792 C1.4593741,4.57109157 1.69475135,3.94458559 2.16813087,3.47295608 L3.48676846,2.15344348 C4.33465155,1.3064354 5.82304076,1.30556039 6.67092386,2.15344348 L9.20844809,4.69096771 C9.91632985,5.39884947 10.0738314,6.4698597 9.60045183,7.35624316 L8.10768758,10.1352697 C8.89869513,13.102423 11.2218423,15.4246952 14.1854956,16.2130777 L16.9575221,14.7211885 C17.8281554,14.253934 18.9236659,14.4149356 19.6227975,15.1131922 Z"
})));
CallOut.displayName = "DecorativeIcon";

const CallReceive = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 22 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1 -1)",
  d: "M13.7643756,10.2128612 C13.7258159,10.1743014 13.6958249,10.1246021 13.6769735,10.0671909 C13.6572651,10.0312018 13.6444119,9.96950611 13.6444119,9.8949572 L13.6444119,4.28150974 C13.6444119,4.0253014 13.8449227,3.82393365 14.1011311,3.82393365 C14.3573394,3.82393365 14.5578503,4.0253014 14.5578503,4.28150974 L14.5578503,8.78957677 L21.4986112,1.85567097 C21.6794137,1.67486843 21.965613,1.67486843 22.1464155,1.85567097 C22.3280749,2.03733039 22.3280749,2.3218159 22.1472724,2.50347532 L15.2056546,9.438238 L19.7137217,9.438238 C19.9707869,9.438238 20.1712977,9.63874887 20.1712977,9.8949572 C20.1712977,10.1511655 19.9707869,10.3516764 19.7137217,10.3516764 L14.1011311,10.3516764 C14.0282959,10.3516764 13.9666003,10.3388231 13.9134735,10.3122597 C13.8774843,10.2985496 13.8329264,10.2728431 13.7892253,10.2377108 L13.7643756,10.2128612 Z M8.78581905,6.9099889 C9.06494672,6.39198395 8.97132083,5.76372795 8.55394184,5.34547396 L6.01641761,2.81582481 C5.76179018,2.56907245 5.43016201,2.43169614 5.0827837,2.43169614 C4.7275303,2.43169614 4.39590214,2.56819744 4.14827477,2.81582481 L2.82263712,4.14233747 C2.5487595,4.40921502 2.40525813,4.78896865 2.43763344,5.15997219 C3.17964052,13.9223059 10.0799564,20.8191217 18.8466651,21.5602538 C19.2202937,21.583879 19.5991723,21.4412526 19.8634248,21.1761251 L21.1890625,19.8504875 C21.4375649,19.6019851 21.5740662,19.2703569 21.5740662,18.9168535 C21.5740662,18.5686002 21.4366898,18.2369721 21.1881875,17.9814696 L18.9674163,15.7598234 C18.5570374,15.3494445 17.9156562,15.2566936 17.4046513,15.5349463 L14.4663733,17.1195864 C14.3578723,17.179087 14.2327461,17.1948371 14.122495,17.1545867 C10.669712,16.3084536 7.99743653,13.6361781 7.15567849,10.1833952 C7.12855323,10.0722691 7.14517839,9.95326796 7.20205393,9.84739195 L8.78581905,6.9099889 Z M19.6227975,15.1131922 L21.8444437,17.3348384 C22.2679478,17.7495924 22.499825,18.3122228 22.499825,18.9168535 C22.499825,19.5179843 22.2653228,20.0841147 21.8383187,20.5119938 L20.5196811,21.8306314 C20.1005521,22.2567604 19.5212966,22.5008878 18.9297909,22.5008878 C18.8746654,22.5008878 18.8204149,22.5008878 18.7652893,22.4930127 C9.54532631,21.7142553 2.28450698,14.456936 1.50574954,5.23609792 C1.4593741,4.57109157 1.69475135,3.94458559 2.16813087,3.47295608 L3.48676846,2.15344348 C4.33465155,1.3064354 5.82304076,1.30556039 6.67092386,2.15344348 L9.20844809,4.69096771 C9.91632985,5.39884947 10.0738314,6.4698597 9.60045183,7.35624316 L8.10768758,10.1352697 C8.89869513,13.102423 11.2218423,15.4246952 14.1854956,16.2130777 L16.9575221,14.7211885 C17.8281554,14.253934 18.9236659,14.4149356 19.6227975,15.1131922 Z"
})));
CallReceive.displayName = "DecorativeIcon";

const CallTalking = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 22 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1 -1)",
  d: "M14.2109267,2.60695 C13.9049267,2.60695 13.6579267,2.35895 13.6579267,2.05395 C13.6579267,1.74895 13.9049267,1.50195 14.2109267,1.50195 C18.7819267,1.50195 22.4999267,5.21995 22.4999267,9.79095 C22.4999267,10.09595 22.2519267,10.34395 21.9469267,10.34395 C21.6429267,10.34395 21.3949267,10.09595 21.3949267,9.79095 C21.3949267,5.82995 18.1719267,2.60695 14.2109267,2.60695 Z M14.2109267,7.02785 C13.9049267,7.02785 13.6579267,6.77985 13.6579267,6.47485 C13.6579267,6.16985 13.9049267,5.92285 14.2109267,5.92285 C16.3439267,5.92285 18.0789267,7.65785 18.0789267,9.79085 C18.0789267,10.09585 17.8309267,10.34385 17.5259267,10.34385 C17.2219267,10.34385 16.9739267,10.09585 16.9739267,9.79085 C16.9739267,8.26785 15.7339267,7.02785 14.2109267,7.02785 Z M8.78581905,6.9099889 C9.06494672,6.39198395 8.97132083,5.76372795 8.55394184,5.34547396 L6.01641761,2.81582481 C5.76179018,2.56907245 5.43016201,2.43169614 5.0827837,2.43169614 C4.7275303,2.43169614 4.39590214,2.56819744 4.14827477,2.81582481 L2.82263712,4.14233747 C2.5487595,4.40921502 2.40525813,4.78896865 2.43763344,5.15997219 C3.17964052,13.9223059 10.0799564,20.8191217 18.8466651,21.5602538 C19.2202937,21.583879 19.5991723,21.4412526 19.8634248,21.1761251 L21.1890625,19.8504875 C21.4375649,19.6019851 21.5740662,19.2703569 21.5740662,18.9168535 C21.5740662,18.5686002 21.4366898,18.2369721 21.1881875,17.9814696 L18.9674163,15.7598234 C18.5570374,15.3494445 17.9156562,15.2566936 17.4046513,15.5349463 L14.4663733,17.1195864 C14.3578723,17.179087 14.2327461,17.1948371 14.122495,17.1545867 C10.669712,16.3084536 7.99743653,13.6361781 7.15567849,10.1833952 C7.12855323,10.0722691 7.14517839,9.95326796 7.20205393,9.84739195 L8.78581905,6.9099889 Z M19.6227975,15.1131922 L21.8444437,17.3348384 C22.2679478,17.7495924 22.499825,18.3122228 22.499825,18.9168535 C22.499825,19.5179843 22.2653228,20.0841147 21.8383187,20.5119938 L20.5196811,21.8306314 C20.1005521,22.2567604 19.5212966,22.5008878 18.9297909,22.5008878 C18.8746654,22.5008878 18.8204149,22.5008878 18.7652893,22.4930127 C9.54532631,21.7142553 2.28450698,14.456936 1.50574954,5.23609792 C1.4593741,4.57109157 1.69475135,3.94458559 2.16813087,3.47295608 L3.48676846,2.15344348 C4.33465155,1.3064354 5.82304076,1.30556039 6.67092386,2.15344348 L9.20844809,4.69096771 C9.91632985,5.39884947 10.0738314,6.4698597 9.60045183,7.35624316 L8.10768758,10.1352697 C8.89869513,13.102423 11.2218423,15.4246952 14.1854956,16.2130777 L16.9575221,14.7211885 C17.8281554,14.253934 18.9236659,14.4149356 19.6227975,15.1131922 Z"
})));
CallTalking.displayName = "DecorativeIcon";

const Camera = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M12,8.9575 C9.449,8.9575 7.374,11.0335 7.374,13.5835 C7.374,16.1355 9.449,18.2115 12,18.2115 C14.552,18.2115 16.627,16.1355 16.627,13.5835 C16.627,11.0335 14.552,8.9575 12,8.9575 Z M6.334,13.5835 C6.334,10.4595 8.876,7.9185 12,7.9185 C15.124,7.9185 17.666,10.4595 17.666,13.5835 C17.666,16.7085 15.124,19.2505 12,19.2505 C8.876,19.2505 6.334,16.7085 6.334,13.5835 Z M8.5063,14.1377 C8.2193,14.1377 7.9863,13.9057 7.9863,13.6187 C7.9863,11.4057 9.7873,9.6047 12.0003,9.6047 C12.2863,9.6047 12.5193,9.8377 12.5193,10.1247 C12.5193,10.4107 12.2863,10.6437 12.0003,10.6437 C10.3603,10.6437 9.0253,11.9787 9.0253,13.6187 C9.0253,13.9057 8.7923,14.1377 8.5063,14.1377 Z M9.666,3.4155 C9.072,3.4155 8.483,3.8915 8.265,4.5465 L7.942,5.5405 C7.741,6.1635 7.165,6.5825 6.509,6.5825 L2.895,6.5825 C1.872,6.5825 1.039,7.4155 1.039,8.4375 L1.039,18.7305 C1.039,19.7535 1.872,20.5855 2.895,20.5855 L21.105,20.5855 C22.129,20.5855 22.961,19.7535 22.961,18.7305 L22.961,8.4375 C22.961,7.4155 22.129,6.5825 21.105,6.5825 L17.49,6.5825 C16.819,6.5825 16.254,6.1885 16.052,5.5785 L15.73,4.5145 C15.518,3.8785 14.931,3.4155 14.334,3.4155 L9.666,3.4155 Z M21.105,5.5435 C22.701,5.5435 24,6.8415 24,8.4375 L24,18.7305 C24,20.3265 22.701,21.6245 21.105,21.6245 L2.895,21.6245 C1.298,21.6245 0,20.3265 0,18.7305 L0,8.4375 C0,6.8415 1.298,5.5435 2.895,5.5435 L6.509,5.5435 C6.712,5.5435 6.891,5.4135 6.954,5.2205 L7.279,4.2215 C7.64,3.1345 8.622,2.3755 9.666,2.3755 L14.334,2.3755 C15.382,2.3755 16.362,3.1255 16.721,4.1995 L17.042,5.2645 C17.099,5.4355 17.27,5.5435 17.49,5.5435 L21.105,5.5435 Z"
})));
Camera.displayName = "DecorativeIcon";

const Car = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "nonzero",
  d: "M2.042 15.958A2.505 2.505 0 0 1 0 13.5v-2C0 10.122 1.122 9 2.5 9c.458 0 .884-.228 1.139-.609l.851-1.278A2.495 2.495 0 0 1 6.57 6h7.228c.565 0 1.12.195 1.562.548L19.3 9.7c.242.194.545.3.854.3H21c1.949 0 3 1.803 3 3.5 0 1.268-.851 2.259-2.043 2.462A2.505 2.505 0 0 1 19.5 18a2.505 2.505 0 0 1-2.45-2H6.95a2.505 2.505 0 0 1-2.45 2 2.505 2.505 0 0 1-2.458-2.042zm.022-1.023A2.505 2.505 0 0 1 4.5 13c1.207 0 2.217.86 2.45 2h10.1c.233-1.14 1.243-2 2.45-2 1.186 0 2.182.83 2.437 1.94.577-.162 1.063-.65 1.063-1.44 0-1.005-.533-2.5-2-2.5h-.845a2.371 2.371 0 0 1-1.479-.52l-3.94-3.151A1.509 1.509 0 0 0 13.798 7H6.57c-.502 0-.969.25-1.248.668l-.851 1.277A2.364 2.364 0 0 1 2.5 10c-.827 0-1.5.673-1.5 1.5v2c0 .676.45 1.248 1.064 1.435zM4.5 14c-.827 0-1.5.673-1.5 1.5S3.673 17 4.5 17 6 16.327 6 15.5 5.327 14 4.5 14zm15 0c-.827 0-1.5.673-1.5 1.5s.673 1.5 1.5 1.5 1.5-.673 1.5-1.5-.673-1.5-1.5-1.5zm-3-3h-5a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 1 0V10h4.5a.5.5 0 0 1 0 1zm-7 0h-4a.5.5 0 0 1-.447-.723l1-2a.5.5 0 1 1 .895.447L6.309 10H9.5a.5.5 0 0 1 0 1zm4 2h-1a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1z"
})));
Car.displayName = "DecorativeIcon";

const CartTeam = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20px",
  height: "20px",
  viewBox: "0 0 20 20"
}, /*#__PURE__*/React.createElement("path", {
  d: "M19.982 9.494c-.005-.022-.005-.046-.014-.068a.437.437 0 00-.093-.14l-1.542-1.541V6.25c0-.678-.331-1.277-.835-1.657l.002-.01v-2.5A2.086 2.086 0 0015.417 0H4.583A2.086 2.086 0 002.5 2.083l.002.01c-.504.38-.836.979-.836 1.658v3.994L.122 9.289l-.009.012a.42.42 0 00-.081.122.436.436 0 00-.032.162v9.165C0 19.44.56 20 1.25 20h17.5c.69 0 1.25-.56 1.25-1.25V9.583c0-.031-.012-.06-.018-.089zm-1.649-.57l.244.243h-.244v-.244zM4.583.833h10.834c.689 0 1.25.56 1.25 1.25v2.125a2.085 2.085 0 00-.417-.042h-6.3c-.538 0-1.014-.344-1.185-.854l-.073-.221a2.081 2.081 0 00-1.977-1.425H3.749c-.12 0-.236.016-.35.036.162-.503.628-.87 1.184-.87zM2.5 7.917V3.751c0-.69.561-1.25 1.25-1.25h2.966c.54 0 1.015.343 1.186.854l.073.22A2.081 2.081 0 009.951 5h6.299c.69 0 1.25.56 1.25 1.25v2.917h-15V7.918zm-.833 1.005v.244h-.243l.243-.244zm17.5 9.827c0 .23-.186.417-.416.417H1.25a.417.417 0 01-.417-.417V10h18.334v8.75zM7.5 14.167h5c.92 0 1.667-.748 1.667-1.667 0-.92-.748-1.667-1.667-1.667h-5c-.92 0-1.667.748-1.667 1.667 0 .92.748 1.667 1.667 1.667zm0-2.5h5c.46 0 .833.374.833.833 0 .46-.374.833-.833.833h-5a.835.835 0 01-.833-.833c0-.46.374-.833.833-.833z"
})));
CartTeam.displayName = "DecorativeIcon";

const Channels = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M17.5,17 L0.5,17 C0.224,17 0,16.776 0,16.5 L0,1.5 C0,1.224 0.224,1 0.5,1 L17.5,1 C17.776,1 18,1.224 18,1.5 L18,16.5 C18,16.776 17.776,17 17.5,17 Z M1,16 L17,16 L17,2 L1,2 L1,16 Z M20.5,20 L3.5,20 C3.224,20 3,19.776 3,19.5 L3,17.5 C3,17.224 3.224,17 3.5,17 C3.776,17 4,17.224 4,17.5 L4,19 L20,19 L20,5 L18.5,5 C18.224,5 18,4.776 18,4.5 C18,4.224 18.224,4 18.5,4 L20.5,4 C20.776,4 21,4.224 21,4.5 L21,19.5 C21,19.776 20.776,20 20.5,20 Z M23.5,23 L6.5,23 C6.224,23 6,22.776 6,22.5 L6,20.5 C6,20.224 6.224,20 6.5,20 C6.776,20 7,20.224 7,20.5 L7,22 L23,22 L23,9 L21.5,9 C21.224,9 21,8.776 21,8.5 C21,8.224 21.224,8 21.5,8 L23.5,8 C23.776,8 24,8.224 24,8.5 L24,22.5 C24,22.776 23.776,23 23.5,23 Z"
})));
Channels.displayName = "DecorativeIcon";

const ChartsBar1 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M1.4365,22.961 L5.1475,22.961 L5.1475,12.124 L1.4365,12.124 L1.4365,22.961 Z M5.6665,11.085 C5.9725,11.085 6.1865,11.298 6.1865,11.604 L6.1865,23.48 C6.1865,23.786 5.9725,24 5.6665,24 L0.9165,24 C0.6095,24 0.3965,23.786 0.3965,23.48 L0.3965,11.604 C0.3965,11.298 0.6095,11.085 0.9165,11.085 L5.6665,11.085 Z M10.1445,22.961 L13.8555,22.961 L13.8555,1.039 L10.1445,1.039 L10.1445,22.961 Z M14.3765,0 C14.6825,0 14.8955,0.213 14.8955,0.52 L14.8955,23.48 C14.8955,23.786 14.6825,24 14.3765,24 L9.6245,24 C9.3195,24 9.1055,23.786 9.1055,23.48 L9.1055,0.52 C9.1055,0.213 9.3195,0 9.6245,0 L14.3765,0 Z M18.8535,22.961 L22.5655,22.961 L22.5655,5.79 L18.8535,5.79 L18.8535,22.961 Z M23.0855,4.75 C23.3915,4.75 23.6035,4.964 23.6035,5.271 L23.6035,23.48 C23.6035,23.786 23.3915,24 23.0855,24 L18.3355,24 C18.0285,24 17.8145,23.786 17.8145,23.48 L17.8145,5.271 C17.8145,4.964 18.0285,4.75 18.3355,4.75 L23.0855,4.75 Z"
})));
ChartsBar1.displayName = "DecorativeIcon";

const ChartsBar2 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4.5,24 L1.5,24 C1.224,24 1,23.776 1,23.5 L1,17.5 C1,17.224 1.224,17 1.5,17 L4.5,17 C4.776,17 5,17.224 5,17.5 L5,23.5 C5,23.776 4.776,24 4.5,24 Z M2,23 L4,23 L4,18 L2,18 L2,23 Z M10.5,24 L7.5,24 C7.224,24 7,23.776 7,23.5 L7,12.5 C7,12.224 7.224,12 7.5,12 L10.5,12 C10.776,12 11,12.224 11,12.5 L11,23.5 C11,23.776 10.776,24 10.5,24 Z M8,23 L10,23 L10,13 L8,13 L8,23 Z M16.5,24 L13.5,24 C13.224,24 13,23.776 13,23.5 L13,14.5 C13,14.224 13.224,14 13.5,14 L16.5,14 C16.776,14 17,14.224 17,14.5 L17,23.5 C17,23.776 16.776,24 16.5,24 Z M14,23 L16,23 L16,15 L14,15 L14,23 Z M22.5,24 L19.5,24 C19.224,24 19,23.776 19,23.5 L19,8.5 C19,8.224 19.224,8 19.5,8 L22.5,8 C22.776,8 23,8.224 23,8.5 L23,23.5 C23,23.776 22.776,24 22.5,24 Z M20,23 L22,23 L22,9 L20,9 L20,23 Z M7.79917342,7.59855456 L4.74904694,10.0305652 C4.90889317,10.3178755 5,10.6484762 5,11 C5,12.103 4.103,13 3,13 C1.897,13 1,12.103 1,11 C1,9.897 1.897,9 3,9 C3.38780812,9 3.75015087,9.11088562 4.05699501,9.30262361 L7.17445059,6.81692826 C7.06237367,6.56739018 7,6.29085729 7,6 C7,4.897 7.897,4 9,4 C10.103,4 11,4.897 11,6 C11,6.01667664 10.999795,6.0333062 10.9993872,6.04988627 L13.4424213,6.74659212 C13.8092998,6.29154404 14.3711727,6 15,6 C15.370495,6 15.7177475,6.10120594 16.0155699,6.27743007 L19.2774301,3.01556993 C19.1012059,2.71774752 19,2.37049496 19,2 C19,0.897 19.897,0 21,0 C22.103,0 23,0.897 23,2 C23,3.103 22.103,4 21,4 C20.629505,4 20.2822525,3.89879406 19.9844301,3.72256993 L16.7225699,6.98443007 C16.8987941,7.28225248 17,7.62950504 17,8 C17,9.103 16.103,10 15,10 C13.897,10 13,9.103 13,8 C13,7.88705829 13.0094048,7.77627644 13.0274726,7.66839629 L10.7248367,7.01172927 C10.3769452,7.6026733 9.73409652,8 9,8 C8.54972475,8 8.13377939,7.85051502 7.79917342,7.59855456 Z M3.6907998,10.2775238 C3.51122497,10.1057239 3.26785668,10 3,10 C2.448,10 2,10.449 2,11 C2,11.551 2.448,12 3,12 C3.552,12 4,11.551 4,11 C4,10.7325572 3.89445521,10.4891446 3.72270222,10.309442 C3.71168523,10.2993732 3.70103675,10.2887326 3.6907998,10.2775238 Z M8.23839057,6.64742929 C8.42185973,6.8629766 8.69506079,7 9,7 C9.552,7 10,6.551 10,6 C10,5.449 9.552,5 9,5 C8.448,5 8,5.449 8,6 C8,6.2244842 8.0743612,6.43203794 8.19982084,6.59919562 C8.20674293,6.60686891 8.21347368,6.61480416 8.22,6.623 C8.22641727,6.63101232 8.23254697,6.63915948 8.23839057,6.64742929 Z M20.3131633,2.72624713 C20.4923477,2.89582187 20.7341087,3 21,3 C21.552,3 22,2.551 22,2 C22,1.449 21.552,1 21,1 C20.448,1 20,1.449 20,2 C20,2.2656195 20.1041105,2.50753526 20.2737941,2.6868737 C20.2806628,2.69302583 20.2874013,2.69940127 20.294,2.706 C20.3006119,2.71261195 20.3069997,2.71936416 20.3131633,2.72624713 Z M23.5,24 L0.5,24 C0.224,24 0,23.776 0,23.5 C0,23.224 0.224,23 0.5,23 L23.5,23 C23.776,23 24,23.224 24,23.5 C24,23.776 23.776,24 23.5,24 Z M15,7 C14.448,7 14,7.449 14,8 C14,8.551 14.448,9 15,9 C15.552,9 16,8.551 16,8 C16,7.449 15.552,7 15,7 Z"
})));
ChartsBar2.displayName = "DecorativeIcon";

const ChartsLine = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "23",
  height: "24",
  viewBox: "0 0 23 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M22.56,24.04 L0.48,24.04 C0.21504,24.04 0,23.82496 0,23.56 L0,1.48 C0,1.21504 0.21504,1 0.48,1 C0.74496,1 0.96,1.21504 0.96,1.48 L0.96,23.08 L22.56,23.08 C22.82496,23.08 23.04,23.29504 23.04,23.56 C23.04,23.82496 22.82496,24.04 22.56,24.04 Z M3.36,21.16 C3.27264,21.16 3.18432,21.13696 3.1056,21.08704 C2.88096,20.94688 2.81184,20.65024 2.95296,20.4256 L5.35296,16.5856 C5.43648,16.4512 5.58144,16.36672 5.73888,16.36096 C5.92416,16.35328 6.04896,16.42624 6.144,16.55296 L7.15584,17.90176 L12.54816,8.91424 C12.63072,8.776 12.77568,8.68864 12.936,8.68 C13.07904,8.67712 13.24896,8.74336 13.34496,8.872 L15.79104,12.13312 L22.14624,1.23808 C22.27968,1.00864 22.57344,0.9328 22.80288,1.06528 C23.03136,1.19872 23.10912,1.49248 22.97568,1.72192 L16.25568,13.24192 C16.17504,13.38112 16.03008,13.46944 15.86976,13.47904 C15.71424,13.4848 15.55392,13.4176 15.45696,13.288 L13.00512,10.0192 L7.6128,19.00672 C7.52928,19.144 7.38432,19.23136 7.224,19.24 C7.0848,19.2496 6.91104,19.17664 6.816,19.048 L5.79552,17.68768 L3.76704,20.9344 C3.67584,21.08032 3.51936,21.16 3.36,21.16 Z"
})));
ChartsLine.displayName = "DecorativeIcon";

const Chat1 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M7.4702,9.7948 C7.8912,9.7948 8.1622,9.5238 8.1622,9.1028 C8.1622,8.6818 7.8912,8.4098 7.4702,8.4098 C7.0492,8.4098 6.7772,8.6818 6.7772,9.1028 C6.7772,9.5238 7.0492,9.7948 7.4702,9.7948 Z M7.4702,7.3458 C8.4382,7.3458 9.2262,8.1338 9.2262,9.1028 C9.2262,10.0708 8.4382,10.8578 7.4702,10.8578 C6.5012,10.8578 5.7142,10.0708 5.7142,9.1028 C5.7142,8.1338 6.5012,7.3458 7.4702,7.3458 Z M12.3672,9.7948 C12.7882,9.7948 13.0602,9.5238 13.0602,9.1028 C13.0602,8.6818 12.7882,8.4098 12.3672,8.4098 C11.9462,8.4098 11.6752,8.6818 11.6752,9.1028 C11.6752,9.5238 11.9462,9.7948 12.3672,9.7948 Z M12.3672,7.3458 C13.3362,7.3458 14.1232,8.1338 14.1232,9.1028 C14.1232,10.0708 13.3362,10.8578 12.3672,10.8578 C11.3992,10.8578 10.6112,10.0708 10.6112,9.1028 C10.6112,8.1338 11.3992,7.3458 12.3672,7.3458 Z M17.2646,9.7948 C17.6856,9.7948 17.9566,9.5238 17.9566,9.1028 C17.9566,8.6818 17.6856,8.4098 17.2646,8.4098 C16.8436,8.4098 16.5726,8.6818 16.5726,9.1028 C16.5726,9.5238 16.8436,9.7948 17.2646,9.7948 Z M17.2646,7.3458 C18.2336,7.3458 19.0206,8.1338 19.0206,9.1028 C19.0206,10.0708 18.2336,10.8578 17.2646,10.8578 C16.2956,10.8578 15.5086,10.0708 15.5086,9.1028 C15.5086,8.1338 16.2956,7.3458 17.2646,7.3458 Z M22.9355,13.8363 L22.9355,3.5523 C22.9355,2.1593 21.7585,0.9823 20.3665,0.9823 L3.6335,1.0643 C2.2405,1.0643 1.0635,2.2403 1.0635,3.6333 L1.0635,13.8363 C1.0635,15.2293 2.2405,16.4063 3.6335,16.4063 L6.2455,16.4063 C6.4585,16.4063 6.5695,16.5163 6.6585,16.6043 C6.7775,16.7243 6.7775,16.9163 6.7775,17.1023 L6.7695,17.1473 L4.9725,21.8613 L11.6375,16.5153 C11.7445,16.4063 11.8685,16.4063 11.9595,16.4063 L20.3665,16.4063 C21.7585,16.4063 22.9355,15.2293 22.9355,13.8363 Z M20.3665,0.0003 C22.3695,0.0003 23.9995,1.6293 23.9995,3.6333 L23.9995,13.8363 C23.9995,15.8403 22.3695,17.4703 20.3665,17.4703 L12.1655,17.4703 L4.0855,23.9183 L3.7965,23.9183 C3.7095,23.9183 3.5915,23.9183 3.4785,23.8153 C3.3795,23.7583 3.3015,23.6583 3.2605,23.5383 C3.2185,23.4103 3.2245,23.2753 3.2775,23.1683 L5.4145,17.3883 L3.6335,17.3883 C1.6295,17.3883 -0.0005,15.7583 -0.0005,13.7553 L-0.0005,3.6333 C-0.0005,1.6643 1.6645,0.0003 3.6335,0.0003 L20.3665,0.0003 Z"
})));
Chat1.displayName = "DecorativeIcon";

const Chat2 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M20.3281,24 C20.1981,24 20.0701,23.949 19.9741,23.854 L16.1551,20.034 L7.6381,20.034 C6.6551,20.034 5.7661,19.527 5.3181,18.71 C5.1851,18.47 5.2731,18.165 5.5151,18.032 C5.7561,17.898 6.0611,17.987 6.1941,18.23 C6.4621,18.719 7.0291,19.035 7.6381,19.035 L16.3621,19.035 C16.4951,19.035 16.6211,19.088 16.7151,19.182 L19.8281,22.295 L19.8281,19.535 C19.8281,19.259 20.0521,19.035 20.3281,19.035 L21.5171,19.035 C22.3361,19.035 23.0011,18.37 23.0011,17.553 L23.0011,8.431 C23.0011,7.832 22.5141,7.345 21.9141,7.345 L18.7411,7.345 C18.4661,7.345 18.2421,7.122 18.2421,6.845 C18.2421,6.569 18.4661,6.346 18.7411,6.346 L21.9141,6.346 C23.0641,6.346 24.0001,7.281 24.0001,8.431 L24.0001,17.553 C24.0001,18.921 22.8861,20.034 21.5171,20.034 L20.8271,20.034 L20.8271,23.501 C20.8271,23.703 20.7051,23.885 20.5191,23.962 C20.4581,23.987 20.3921,24 20.3281,24 Z M2.0859,1 C1.4869,1 0.9999,1.487 0.9999,2.086 L0.9999,11.604 C0.9999,12.204 1.4869,12.691 2.0859,12.691 L3.6719,12.691 C3.9479,12.691 4.1709,12.914 4.1709,13.19 L4.1709,16.043 L7.8019,12.817 C7.8929,12.736 8.0109,12.691 8.1339,12.691 L15.1729,12.691 C15.9899,12.691 16.6549,12.025 16.6549,11.208 L16.6549,2.086 C16.6549,1.487 16.1679,1 15.5689,1 L2.0859,1 Z M3.6719,17.654 C3.6029,17.654 3.5329,17.64 3.4669,17.611 C3.2879,17.53 3.1719,17.353 3.1719,17.155 L3.1719,13.689 L2.0859,13.689 C0.9359,13.689 -0.0001,12.754 -0.0001,11.604 L-0.0001,2.086 C-0.0001,0.937 0.9359,-1.77635684e-15 2.0859,-1.77635684e-15 L15.5689,-1.77635684e-15 C16.7189,-1.77635684e-15 17.6539,0.937 17.6539,2.086 L17.6539,11.208 C17.6539,12.576 16.5419,13.689 15.1729,13.689 L8.3229,13.689 L4.0039,17.529 C3.9109,17.612 3.7919,17.654 3.6719,17.654 Z"
})));
Chat2.displayName = "DecorativeIcon";

const ChatSupport = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M9.997 21.645l-2.315-3.15-1.169 1.722 1.413.298.162.06 1.908 1.07zm-2.957-4.377c.038-.079.102-.149.19-.198.129-.073.281-.087.417-.051.187-.049.393-.005.532.118.157.14.187.349.075.516l3.747 5.099 3.748-5.1c-.112-.167-.083-.377.075-.517.138-.122.346-.166.532-.117.135-.036.288-.022.416.05.088.05.153.12.19.198l4.856 2.042c.68.286 1.175.806 1.359 1.426l.808 2.719c.04.13.004.269-.095.375-.098.108-.249.17-.409.17h-22.961c-.16 0-.311-.062-.41-.168-.099-.106-.133-.244-.095-.375l.808-2.719c.184-.62.679-1.14 1.359-1.426l4.856-2.043zm9.279 1.225l-2.314 3.149 1.907-1.07.162-.06 1.413-.297-1.169-1.722zm1.854-7.559l-.2-.009c.018.149.028.302.028.456 0 1.229-.572 2.163-1.338 2.205-.066.209-.14.411-.22.609.82-.372 1.467-.908 1.467-1.624 0-.303.225-.551.51-.57-.098-.365-.181-.726-.246-1.066zm-.138-.906c-.023-.218-.035-.415-.035-.585 0-.245.224-.444.5-.444s.5.199.5.444c0 1.436.898 4.613 1.854 5.463.195.173.195.455 0 .628-1.105.983-4.868 1.414-5.293 1.46l-.061.004c-.25 0-.465-.165-.496-.39-.01-.071 0-.141.026-.204-.971 1.008-2.208 1.595-3.529 1.595-1.042 0-2.031-.365-2.879-1.013l-.12.013-.061-.003c-.425-.046-4.188-.477-5.293-1.46-.195-.173-.195-.455 0-.628.956-.851 1.854-4.028 1.854-5.464l.004-.058-.005-.21c0-3.406 2.916-6.176 6.5-6.176s6.5 2.771 6.5 6.176c0 .272-.023.548-.072.847l.107.007zm-1.018.795c-2.988-.456-5.898-2.168-7.27-3.488-.692 2.028-2.947 3.124-3.757 3.461-.04.183-.061.381-.061.584 0 .854.348 1.324.464 1.324.079-.047.176-.073.272-.073l.163.029c.137.053.254.155.291.292.65 2.491 2.411 4.164 4.382 4.164.99 0 1.927-.422 2.697-1.158-.248.027-.469.04-.651.04-.121 0-.233-.041-.323-.111-.211.072-.455.111-.722.111-.869 0-1.5-.42-1.5-1 0-.58.631-1 1.5-1 .784 0 1.374.341 1.482.834.359-.034.794-.107 1.242-.221.276-.497.5-1.054.658-1.659.036-.137.138-.25.276-.303.138-.054.293-.041.42.034.149.026.494-.45.494-1.303 0-.193-.019-.382-.055-.557zm-.011-.912c.045-.263.066-.504.066-.736 0-2.92-2.499-5.294-5.571-5.294-3.073 0-5.571 2.374-5.571 5.294 0 .196.015.397.046.613 1.038-.514 2.951-1.727 2.951-3.693 0-.248.23-.449.512-.449.283 0 .512.201.512.449.136.522 3.393 3.194 7.055 3.816zm1.857 3.461c-.445 1.234-1.894 1.949-3.237 2.313-.123.172-.252.335-.387.49l.201-.063c1.275-.138 3.376-.507 4.343-.978-.348-.457-.659-1.082-.92-1.763zm-13.533-.536c-.295.883-.674 1.724-1.112 2.298.751.366 2.186.669 3.386.852-.539-.669-.973-1.481-1.266-2.401-.412-.023-.768-.303-1.009-.749zm7.908 10.286h9.576l-.646-2.175c-.11-.372-.409-.684-.816-.856l-3.848-1.619 1.228 1.808c.081.119.09.262.027.388s-.194.22-.353.253l-1.993.419-3.176 1.781zm-12.051 0h9.577l-3.176-1.782-1.993-.419c-.158-.033-.288-.127-.353-.253-.064-.126-.054-.27.027-.389l1.228-1.808-3.848 1.619c-.408.172-.705.484-.816.856l-.646 2.175z"
})));
ChatSupport.displayName = "DecorativeIcon";

const Check = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M1.02081528,13.0208153 L23.5208153,13.0208153 C23.7969577,13.0208153 24.0208153,13.2446729 24.0208153,13.5208153 C24.0208153,13.7969577 23.7969577,14.0208153 23.5208153,14.0208153 L0.52081528,14.0208153 C0.244672905,14.0208153 0.0208152802,13.7969577 0.0208152802,13.5208153 L0.0208152802,4.52081528 C0.0208152802,4.24467291 0.244672905,4.02081528 0.52081528,4.02081528 C0.796957655,4.02081528 1.02081528,4.24467291 1.02081528,4.52081528 L1.02081528,13.0208153 Z",
  transform: "rotate(-45 12.02 9.02)"
})));
Check.displayName = "DecorativeIcon";

const Clipboard = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "25",
  viewBox: "0 0 24 25"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M4.9376,3.0654 L4.9376,4.7734 L12.7286,4.7734 L12.7286,3.0654 C12.7286,2.7814 12.4976,2.5514 12.2136,2.5514 L10.4246,2.5514 C10.1586,2.5514 9.9446,2.3364 9.9446,2.0714 C9.9446,1.4584 9.4456,0.9604 8.8336,0.9604 C8.2806,0.9604 7.8206,1.3654 7.7356,1.8954 C7.7576,1.9494 7.7696,2.0084 7.7696,2.0714 C7.7696,2.3364 7.5546,2.5514 7.2896,2.5514 L5.4526,2.5514 C5.1686,2.5514 4.9376,2.7814 4.9376,3.0654 Z M17.1866,17.5014 C17.4516,17.5014 17.6666,17.7164 17.6666,17.9824 L17.6666,21.9594 C17.6666,23.1014 16.7376,24.0294 15.5946,24.0294 L2.0716,24.0294 C0.9286,24.0294 0.0006,23.1014 0.0006,21.9594 L0.0006,5.2534 C0.0006,4.1114 0.9286,3.1824 2.0716,3.1824 L3.9776,3.1824 L3.9776,3.0654 C3.9776,2.2524 4.6386,1.5914 5.4526,1.5914 L6.8186,1.5914 C7.0356,0.6794 7.8556,0.0004 8.8336,0.0004 C9.8096,0.0004 10.6306,0.6794 10.8476,1.5914 L12.2136,1.5914 C13.0266,1.5914 13.6876,2.2524 13.6876,3.0654 L13.6876,3.1824 L15.5946,3.1824 C16.7376,3.1824 17.6666,4.1114 17.6666,5.2534 L17.6666,6.8444 C17.6666,7.1094 17.4516,7.3244 17.1866,7.3244 C16.9216,7.3244 16.7066,7.1094 16.7066,6.8444 L16.7066,5.2534 C16.7066,4.6404 16.2076,4.1424 15.5946,4.1424 L13.6876,4.1424 L13.6876,5.2534 C13.6876,5.5184 13.4736,5.7324 13.2076,5.7324 L4.4576,5.7324 C4.1916,5.7324 3.9776,5.5184 3.9776,5.2534 L3.9776,4.1424 L2.0716,4.1424 C1.4586,4.1424 0.9596,4.6404 0.9596,5.2534 L0.9596,21.9594 C0.9596,22.5714 1.4586,23.0704 2.0716,23.0704 L15.5946,23.0704 C16.2076,23.0704 16.7066,22.5714 16.7066,21.9594 L16.7066,17.9824 C16.7066,17.7164 16.9216,17.5014 17.1866,17.5014 Z M22.6305,9.0981 C23.1795,8.5251 23.1785,7.6101 22.6215,7.0231 C22.0455,6.4261 21.0865,6.4051 20.4845,6.9771 L18.7245,8.7371 L20.8585,10.8711 L22.6305,9.0981 Z M14.2515,17.4841 L20.1795,11.5511 L18.0455,9.4161 L12.1235,15.3371 C12.6105,15.5191 13.0585,15.8001 13.4155,16.1821 C13.7915,16.5331 14.0715,16.9861 14.2515,17.4841 Z M11.4295,16.1311 L10.9235,18.6741 L13.4495,18.1721 C13.3525,17.6711 13.1095,17.2081 12.7375,16.8611 C12.3765,16.4761 11.9215,16.2331 11.4295,16.1311 Z M23.3155,6.3601 C24.2285,7.3231 24.2275,8.8191 23.3165,9.7701 L14.1675,18.9261 C14.1015,18.9941 14.0155,19.0381 13.9225,19.0571 L10.4065,19.7561 C10.3755,19.7631 10.3435,19.7661 10.3125,19.7661 C10.1865,19.7661 10.0645,19.7161 9.9735,19.6251 C9.8595,19.5121 9.8105,19.3501 9.8415,19.1921 L10.5425,15.6761 C10.5605,15.5831 10.6065,15.4971 10.6725,15.4301 L17.6965,8.4071 C17.6985,8.4041 17.7025,8.4011 17.7055,8.3981 C17.7085,8.3941 17.7125,8.3921 17.7155,8.3891 L19.8145,6.2901 C20.8075,5.3461 22.3735,5.3801 23.3155,6.3601 Z"
})));
Clipboard.displayName = "DecorativeIcon";

const CloudDownload = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M9.2233,20.39335 C9.4103,20.19635 9.7563,20.18735 9.9563,20.37935 L11.0483,21.42735 L11.0483,12.40035 C11.0483,12.09435 11.2613,11.88035 11.5673,11.88035 C11.8723,11.88035 12.0863,12.09435 12.0863,12.40035 L12.0863,21.42735 L13.1773,20.37935 C13.3723,20.18935 13.7193,20.19335 13.9103,20.39335 C14.0073,20.49335 14.0583,20.62435 14.0553,20.76335 C14.0523,20.90235 13.9953,21.03135 13.8963,21.12735 L11.9263,23.01935 C11.9033,23.04135 11.8773,23.05535 11.8603,23.06535 L11.8333,23.08135 C11.8153,23.09435 11.7913,23.11235 11.7603,23.12435 C11.7313,23.13635 11.7023,23.14135 11.6803,23.14435 L11.6193,23.02935 L11.6473,23.15135 C11.6043,23.16035 11.5283,23.16135 11.4863,23.15035 L11.4723,23.02135 L11.4533,23.14435 C11.4313,23.14135 11.4033,23.13635 11.3723,23.12435 C11.3423,23.11235 11.3183,23.09435 11.3003,23.08135 L11.2733,23.06435 C11.2553,23.05535 11.2313,23.04135 11.2063,23.01835 L9.2373,21.12635 C9.1373,21.03135 9.0803,20.90235 9.0773,20.76335 C9.0753,20.62335 9.1263,20.49335 9.2233,20.39335 Z M18.8405,6.75865 C21.7335,6.96765 23.9855,9.32165 23.9855,12.15765 C23.9045,15.18265 21.4095,17.64165 18.4225,17.64165 L13.9305,17.64165 C13.6245,17.64165 13.4115,17.42765 13.4115,17.12165 C13.4115,16.81665 13.6245,16.60365 13.9305,16.60365 L18.4225,16.60365 C20.8735,16.60365 22.8675,14.60965 22.8675,12.15765 C22.8675,9.70565 20.8735,7.71165 18.4225,7.71165 C18.1405,7.71165 17.8245,7.52365 17.8245,7.27165 C17.3635,4.20565 14.6385,1.87965 11.4875,1.87965 C7.9065,1.87965 4.9935,4.75865 4.9935,8.29565 C4.9935,8.60865 4.9935,8.83565 5.0695,9.21665 C5.0715,9.33465 5.0715,9.52965 4.9575,9.64465 C4.8405,9.76065 4.6465,9.76065 4.5525,9.76065 L4.4745,9.76065 C2.5875,9.76065 1.0525,11.29565 1.0525,13.18165 C1.0525,15.06865 2.5875,16.60365 4.4745,16.60365 L9.2025,16.60365 C9.5075,16.60365 9.7215,16.81665 9.7215,17.12165 C9.7215,17.42765 9.5075,17.64165 9.2025,17.64165 L4.4745,17.64165 C2.0565,17.64165 0.0145,15.59965 0.0145,13.18165 C0.0145,10.88265 1.6985,9.02965 4.0335,8.73665 L4.0335,8.21665 C3.9965,6.29265 4.7225,4.46965 6.0805,3.08565 C7.4985,1.63865 9.4195,0.84165 11.4875,0.84165 C14.9985,0.84165 18.0755,3.32465 18.8405,6.75865 Z"
})));
CloudDownload.displayName = "DecorativeIcon";

const CloudSync = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M11.9036,15.27935 C11.8866,15.30435 11.8766,15.33235 11.8546,15.35335 L10.3546,16.85335 C10.2566,16.95135 10.1286,17.00035 10.0006,17.00035 C9.8726,17.00035 9.7446,16.95135 9.6466,16.85335 C9.4516,16.65935 9.4516,16.34135 9.6466,16.14635 L10.2936,15.50035 L9.5006,15.50035 C8.1226,15.50035 7.0006,16.62235 7.0006,18.00035 C7.0006,19.37835 8.1226,20.50035 9.5006,20.50035 C9.7766,20.50035 10.0006,20.72335 10.0006,21.00035 C10.0006,21.27635 9.7766,21.50035 9.5006,21.50035 C7.5706,21.50035 6.0006,19.92935 6.0006,18.00035 C6.0006,16.07035 7.5706,14.50035 9.5006,14.50035 L10.2936,14.50035 L9.6476,13.85335 C9.4526,13.65935 9.4526,13.34235 9.6476,13.14635 C9.8416,12.95235 10.1596,12.95235 10.3546,13.14635 L11.8546,14.64635 C11.8586,14.65135 11.8596,14.65735 11.8636,14.66135 C11.9036,14.70535 11.9386,14.75435 11.9616,14.80835 C12.0126,14.93135 12.0126,15.07035 11.9616,15.19235 C11.9476,15.22535 11.9236,15.25135 11.9036,15.27935 Z M13.5003,14.50005 C15.4303,14.50005 17.0003,16.07005 17.0003,18.00005 C17.0003,19.93005 15.4303,21.50005 13.5003,21.50005 L12.7073,21.50005 L13.3543,22.14605 C13.5483,22.34105 13.5483,22.65805 13.3543,22.85405 C13.2563,22.95105 13.1283,23.00005 13.0003,23.00005 C12.8723,23.00005 12.7443,22.95105 12.6463,22.85405 L11.1463,21.35405 C11.1243,21.33205 11.1143,21.30505 11.0973,21.27905 C11.0773,21.25105 11.0533,21.22605 11.0393,21.19205 C10.9883,21.07005 10.9883,20.93205 11.0393,20.80905 C11.0623,20.75405 11.0963,20.70505 11.1363,20.66105 C11.1413,20.65705 11.1423,20.65105 11.1463,20.64605 L12.6463,19.14605 C12.8413,18.95205 13.1583,18.95205 13.3543,19.14605 C13.5483,19.34205 13.5483,19.65905 13.3543,19.85405 L12.7073,20.50005 L13.5003,20.50005 C14.8783,20.50005 16.0003,19.37805 16.0003,18.00005 C16.0003,16.62205 14.8783,15.50005 13.5003,15.50005 C13.2243,15.50005 13.0003,15.27605 13.0003,15.00005 C13.0003,14.72405 13.2243,14.50005 13.5003,14.50005 Z M18.846,7.02295 C21.758,7.23195 24,9.60895 24,12.49995 C24,15.53295 21.534,17.99995 18.5,17.99995 C18.224,17.99995 18,17.77595 18,17.49995 C18,17.22395 18.224,16.99995 18.5,16.99995 C20.982,16.99995 23,14.98095 23,12.49995 C23,10.01895 20.982,7.99995 18.5,7.99995 C18.223,7.97295 17.962,7.82895 17.927,7.57795 C17.474,4.39795 14.711,1.99995 11.5,1.99995 C7.916,1.99995 5,4.91595 5,8.49995 C5,8.77995 5.024,9.07795 5.076,9.43795 C5.097,9.58295 5.053,9.72995 4.956,9.83995 C4.858,9.94895 4.7,9.99595 4.573,10.00895 C4.55,10.00895 4.49,10.00295 4.467,9.99895 C2.57,9.99995 1,11.56995 1,13.49995 C1,15.42995 2.57,16.99995 4.5,16.99995 C4.776,16.99995 5,17.22395 5,17.49995 C5,17.77595 4.776,17.99995 4.5,17.99995 C2.019,17.99995 1.73472348e-18,15.98095 1.73472348e-18,13.49995 C1.73472348e-18,11.17995 1.765,9.26495 4.022,9.02495 C4.007,8.84195 4,8.66895 4,8.49995 C4,4.36395 7.365,0.99995 11.5,0.99995 C15.066,0.99995 18.152,3.56095 18.846,7.02295 Z"
})));
CloudSync.displayName = "DecorativeIcon";

const CloudUpload = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M13.9098,14.64535 C13.7228,14.84235 13.3768,14.85135 13.1768,14.65935 L12.0848,13.61135 L12.0848,22.63835 C12.0848,22.94435 11.8718,23.15835 11.5658,23.15835 C11.2608,23.15835 11.0468,22.94435 11.0468,22.63835 L11.0468,13.61135 L9.9548,14.65935 C9.7608,14.84935 9.4128,14.84535 9.2218,14.64535 C9.1258,14.54535 9.0748,14.41435 9.0768,14.27535 C9.0798,14.13635 9.1368,14.00735 9.2368,13.91135 L11.2068,12.01935 C11.2298,11.99735 11.2558,11.98235 11.2728,11.97335 L11.2998,11.95635 C11.3178,11.94335 11.3418,11.92635 11.3728,11.91435 C11.4018,11.90135 11.4308,11.89735 11.4528,11.89435 L11.5138,12.00935 L11.4858,11.88735 C11.5288,11.87835 11.6048,11.87735 11.6468,11.88835 L11.6608,12.01735 L11.6798,11.89435 C11.7018,11.89735 11.7298,11.90135 11.7608,11.91435 C11.7908,11.92635 11.8148,11.94335 11.8328,11.95635 L11.8598,11.97435 C11.8778,11.98335 11.9018,11.99635 11.9268,12.02035 L13.8958,13.91235 C13.9958,14.00735 14.0528,14.13635 14.0558,14.27535 C14.0578,14.41535 14.0068,14.54535 13.9098,14.64535 Z M18.8405,6.75865 C21.7335,6.96765 23.9855,9.32165 23.9855,12.15765 C23.9045,15.18265 21.4095,17.64165 18.4225,17.64165 L13.9305,17.64165 C13.6245,17.64165 13.4115,17.42765 13.4115,17.12165 C13.4115,16.81665 13.6245,16.60365 13.9305,16.60365 L18.4225,16.60365 C20.8735,16.60365 22.8675,14.60965 22.8675,12.15765 C22.8675,9.70565 20.8735,7.71165 18.4225,7.71165 C18.1405,7.71165 17.8245,7.52365 17.8245,7.27165 C17.3635,4.20565 14.6385,1.87965 11.4875,1.87965 C7.9065,1.87965 4.9925,4.75865 4.9925,8.29565 C4.9925,8.60865 4.9925,8.83565 5.0695,9.21665 C5.0715,9.33465 5.0715,9.52965 4.9565,9.64465 C4.8405,9.76065 4.6455,9.76065 4.5525,9.76065 L4.4735,9.76065 C2.5875,9.76065 1.0525,11.29565 1.0525,13.18165 C1.0525,15.06865 2.5875,16.60365 4.4735,16.60365 L9.2015,16.60365 C9.5075,16.60365 9.7205,16.81665 9.7205,17.12165 C9.7205,17.42765 9.5075,17.64165 9.2015,17.64165 L4.4735,17.64165 C2.0565,17.64165 0.0145,15.59965 0.0145,13.18165 C0.0145,10.88265 1.6975,9.02965 4.0335,8.73665 L4.0335,8.21665 C3.9955,6.29265 4.7225,4.46965 6.0795,3.08565 C7.4985,1.63865 9.4185,0.84165 11.4875,0.84165 C14.9985,0.84165 18.0755,3.32465 18.8405,6.75865 Z"
})));
CloudUpload.displayName = "DecorativeIcon";

const Collaboration = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12,23.4782609 C9.7053913,23.4782609 7.46817391,22.6758261 5.69947826,21.2191304 C5.47721739,21.0354783 5.44486957,20.7078261 5.62852174,20.4845217 C5.81113043,20.2633043 6.13982609,20.2288696 6.36313043,20.4146087 C7.94504348,21.717913 9.94747826,22.4347826 12,22.4347826 C14.0546087,22.4347826 16.058087,21.7168696 17.64,20.4114783 C17.8633043,20.2267826 18.1909565,20.2591304 18.3746087,20.4813913 C18.5582609,20.7036522 18.5269565,21.0323478 18.3046957,21.216 C16.5349565,22.6747826 14.2966957,23.4782609 12,23.4782609 Z M21.1346087,16.2772174 C21.093913,16.2772174 21.0532174,16.2730435 21.0125217,16.2626087 C20.7318261,16.1958261 20.5586087,15.914087 20.6264348,15.6333913 C20.7881739,14.9624348 20.8695652,14.2664348 20.8695652,13.5652174 C20.8695652,9.81286957 18.4946087,6.45286957 14.9603478,5.20173913 C14.6890435,5.10469565 14.5471304,4.80730435 14.6431304,4.53495652 C14.7391304,4.26365217 15.0354783,4.12173913 15.3088696,4.21669565 C19.2594783,5.616 21.9130435,9.37147826 21.9130435,13.5652174 C21.9130435,14.3478261 21.8222609,15.1252174 21.6417391,15.8765217 C21.5843478,16.1154783 21.3704348,16.2772174 21.1346087,16.2772174 Z M2.86434783,16.274087 C2.62852174,16.274087 2.4146087,16.1133913 2.35721739,15.8733913 C2.17773913,15.12 2.08695652,14.3436522 2.08695652,13.5652174 C2.08695652,9.34852174 4.7613913,5.58469565 8.74226087,4.19895652 C9.01252174,4.10608696 9.312,4.248 9.40591304,4.5213913 C9.50086957,4.79373913 9.35791304,5.09113043 9.08556522,5.18608696 C5.52313043,6.42365217 3.13043478,9.792 3.13043478,13.5652174 C3.13043478,14.2622609 3.21182609,14.9582609 3.37147826,15.6302609 C3.43826087,15.912 3.26504348,16.1926957 2.98434783,16.2594783 C2.94469565,16.269913 2.904,16.274087 2.86434783,16.274087 Z M20.3478261,22.4347826 C18.333913,22.4347826 16.6956522,20.7965217 16.6956522,18.7826087 C16.6956522,16.7686957 18.333913,15.1304348 20.3478261,15.1304348 C22.3617391,15.1304348 24,16.7686957 24,18.7826087 C24,20.7965217 22.3617391,22.4347826 20.3478261,22.4347826 Z M20.3478261,16.173913 C18.909913,16.173913 17.7391304,17.3436522 17.7391304,18.7826087 C17.7391304,20.2215652 18.909913,21.3913043 20.3478261,21.3913043 C21.7857391,21.3913043 22.9565217,20.2215652 22.9565217,18.7826087 C22.9565217,17.3436522 21.7857391,16.173913 20.3478261,16.173913 Z M12,7.82608696 C9.98608696,7.82608696 8.34782609,6.18782609 8.34782609,4.17391304 C8.34782609,2.16 9.98608696,0.52173913 12,0.52173913 C14.013913,0.52173913 15.6521739,2.16 15.6521739,4.17391304 C15.6521739,6.18782609 14.013913,7.82608696 12,7.82608696 Z M12,1.56521739 C10.562087,1.56521739 9.39130435,2.73495652 9.39130435,4.17391304 C9.39130435,5.61286957 10.562087,6.7826087 12,6.7826087 C13.437913,6.7826087 14.6086957,5.61286957 14.6086957,4.17391304 C14.6086957,2.73495652 13.437913,1.56521739 12,1.56521739 Z M3.65217391,22.4347826 C1.63826087,22.4347826 0,20.7965217 0,18.7826087 C0,16.7686957 1.63826087,15.1304348 3.65217391,15.1304348 C5.66608696,15.1304348 7.30434783,16.7686957 7.30434783,18.7826087 C7.30434783,20.7965217 5.66608696,22.4347826 3.65217391,22.4347826 Z M3.65217391,16.173913 C2.21426087,16.173913 1.04347826,17.3436522 1.04347826,18.7826087 C1.04347826,20.2215652 2.21426087,21.3913043 3.65217391,21.3913043 C5.09008696,21.3913043 6.26086957,20.2215652 6.26086957,18.7826087 C6.26086957,17.3436522 5.09008696,16.173913 3.65217391,16.173913 Z"
})));
Collaboration.displayName = "DecorativeIcon";

const Compass = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M12,22.9336 C18.029,22.9336 22.934,18.0296 22.934,11.9996 C22.934,5.9716 18.029,1.0666 12,1.0666 C5.972,1.0666 1.066,5.9716 1.066,11.9996 C1.066,18.0296 5.972,22.9336 12,22.9336 Z M12,-0.0004 C18.616,-0.0004 24,5.3836 24,11.9996 C24,18.6166 18.616,23.9996 12,23.9996 C5.383,23.9996 0,18.6166 0,11.9996 C0,5.3836 5.383,-0.0004 12,-0.0004 Z M12,20.4766 C16.674,20.4766 20.477,16.6736 20.477,11.9996 C20.477,7.3266 16.674,3.5236 12,3.5236 C7.326,3.5236 3.524,7.3266 3.524,11.9996 C3.524,16.6736 7.326,20.4766 12,20.4766 Z M12,2.4576 C17.263,2.4576 21.543,6.7376 21.543,11.9996 C21.543,17.2626 17.263,21.5426 12,21.5426 C6.738,21.5426 2.458,17.2626 2.458,11.9996 C2.458,6.7376 6.738,2.4576 12,2.4576 Z M12,12.2856 C12.158,12.2856 12.286,12.1576 12.286,11.9996 C12.286,11.8426 12.158,11.7146 12,11.7146 C11.842,11.7146 11.714,11.8426 11.714,11.9996 C11.714,12.1576 11.842,12.2856 12,12.2856 Z M12,13.3526 C11.254,13.3526 10.648,12.7456 10.648,11.9996 C10.648,11.2546 11.254,10.6476 12,10.6476 C12.746,10.6476 13.353,11.2546 13.353,11.9996 C13.353,12.7456 12.746,13.3526 12,13.3526 Z M15.8984,8.1006 L10.4404,10.4406 L8.1004,15.8986 L13.5594,13.5596 L15.8984,8.1006 Z M16.7054,6.5966 C16.9034,6.5086 17.1344,6.5516 17.2914,6.7086 C17.4464,6.8646 17.4904,7.0946 17.4044,7.2956 L14.4564,14.1756 C14.4014,14.3006 14.3014,14.4006 14.1764,14.4556 L7.2944,17.4056 C7.2284,17.4326 7.1554,17.4476 7.0854,17.4476 C6.9434,17.4476 6.8104,17.3916 6.7094,17.2926 C6.5524,17.1356 6.5084,16.9066 6.5954,16.7046 L9.5444,9.8246 C9.5964,9.7006 9.6954,9.6006 9.8234,9.5446 L16.7054,6.5966 Z"
})));
Compass.displayName = "DecorativeIcon";

const ComputerNetwork = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M1.014 10c.085 1.462.538 2.844 1.294 4.038l.191-.038h2.15c-.382-1.233-.601-2.591-.643-4h-2.993zm0-1h2.993c.042-1.45.263-2.804.628-4h-2.135l-.186-.036c-.748 1.181-1.213 2.558-1.299 4.036zm2.01-5h1.964c.388-.957.876-1.78 1.44-2.426-1.328.517-2.496 1.358-3.404 2.426zm9.548-2.426c.564.646 1.053 1.469 1.44 2.426h1.964c-.908-1.068-2.076-1.909-3.404-2.426zm4.114 3.39l-.186.036h-2.135c.365 1.196.586 2.55.628 4h2.993c-.086-1.477-.551-2.855-1.299-4.036zm2.301 4.036h2.513c1.379 0 2.5 1.122 2.5 2.5v8c0 1.378-1.121 2.5-2.5 2.5h-6.5v1h3.5c.276 0 .5.224.5.5s-.224.5-.5.5h-8c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h3.5v-1h-6.5c-1.379 0-2.5-1.122-2.5-2.5v-1.641c-3.092-1.665-5-4.838-5-8.359 0-5.238 4.262-9.5 9.5-9.5 5.07 0 9.226 3.993 9.487 9zm-13.987 7.702v-1.702h-1.982c.561.657 1.226 1.232 1.982 1.702zm1 .832v.46599999999999997h17v-6.5c0-.827-.673-1.5-1.5-1.5h-14c-.827 0-1.5.673-1.5 1.5v6.034zm-.935-6.603c.08-.343.231-.658.436-.931h-.493c.01.314.029.624.057.931zm-.057-1.931h1.492c.112 0 .216.037.3.1.222-.065.457-.1.7-.1h1.5v-4h-3.294c-.4 1.18-.651 2.548-.698 4zm1.092-5h2.899v-2.945c-1.143.251-2.172 1.351-2.899 2.945zm3.899-2.945v2.945h2.899c-.728-1.595-1.757-2.694-2.899-2.945zm3.294 3.945h-3.294v4h3.992c-.047-1.452-.298-2.82-.698-4zm9.706 14h-17v.5c0 .827.673 1.5 1.5 1.5h14c.827 0 1.5-.673 1.5-1.5v-.5z"
})));
ComputerNetwork.displayName = "DecorativeIcon";

const Contract = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "24",
  viewBox: "0 0 20 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-2)",
  d: "M17.5,6 L11.5,6 C11.224,6 11,6.224 11,6.5 C11,6.776 11.224,7 11.5,7 L17.5,7 C17.776,7 18,6.776 18,6.5 C18,6.224 17.776,6 17.5,6 Z M22,16.5 C22,15.122 20.878,14 19.5,14 C18.122,14 17,15.122 17,16.5 C17,17.31 17.394,18.025 17.994,18.482 L17.01,23.401 C16.973,23.589 17.046,23.781 17.197,23.897 C17.349,24.014 17.554,24.032 17.724,23.947 L19.5,23.059 L21.276,23.947 C21.347,23.982 21.424,24 21.5,24 C21.607,24 21.715,23.965 21.802,23.897 C21.954,23.78 22.027,23.589 21.989,23.401 L21.005,18.483 C21.606,18.025 22,17.311 22,16.5 Z M19.723,22.052 C19.583,21.982 19.417,21.982 19.276,22.052 L18.191,22.595 L18.924,18.926 C19.11,18.971 19.301,19 19.5,19 C19.699,19 19.889,18.971 20.075,18.927 L20.808,22.595 L19.723,22.052 Z M19.5,18 C18.673,18 18,17.327 18,16.5 C18,15.673 18.673,15 19.5,15 C20.327,15 21,15.673 21,16.5 C21,17.327 20.327,18 19.5,18 Z M15.5,21 L3,21 L3,7 L8.5,7 C8.776,7 9,6.776 9,6.5 L9,1 L19,1 L19,12.5 C19,12.776 19.224,13 19.5,13 C19.776,13 20,12.776 20,12.5 L20,0.5 C20,0.224 19.776,0 19.5,0 L8.5,0 C8.433,0 8.368,0.014 8.307,0.039 C8.278,0.051 8.256,0.073 8.23,0.09 C8.202,0.108 8.17,0.122 8.146,0.146 L2.146,6.146 C2.123,6.169 2.11,6.2 2.092,6.227 C2.074,6.254 2.051,6.277 2.039,6.307 C2.014,6.368 2,6.433 2,6.5 L2,21.5 C2,21.776 2.224,22 2.5,22 L15.5,22 C15.776,22 16,21.776 16,21.5 C16,21.224 15.776,21 15.5,21 Z M8,1.707 L8,6 L3.707,6 L8,1.707 Z M17.5,10 L4.5,10 C4.224,10 4,10.224 4,10.5 C4,10.776 4.224,11 4.5,11 L17.5,11 C17.776,11 18,10.776 18,10.5 C18,10.224 17.776,10 17.5,10 Z M15.5,14 L4.5,14 C4.224,14 4,14.224 4,14.5 C4,14.776 4.224,15 4.5,15 L15.5,15 C15.776,15 16,14.776 16,14.5 C16,14.224 15.776,14 15.5,14 Z M8.5,19 C8.776,19 9,18.776 9,18.5 C9,18.224 8.776,18 8.5,18 L4.5,18 C4.224,18 4,18.224 4,18.5 C4,18.776 4.224,19 4.5,19 L8.5,19 Z"
})));
Contract.displayName = "DecorativeIcon";

const CreditCard = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "16",
  viewBox: "0 0 24 16"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -4)",
  d: "M23,7 L23,6.5 C23,5.673 22.327,5 21.5,5 L2.5,5 C1.673,5 1,5.673 1,6.5 L1,7 L23,7 Z M23,11 L1,11 L1,17.5 C1,18.327 1.673,19 2.5,19 L21.5,19 C22.327,19 23,18.327 23,17.5 L23,11 Z M21.5,20 L2.5,20 C1.122,20 0,18.878 0,17.5 L0,6.5 C0,5.122 1.122,4 2.5,4 L21.5,4 C22.878,4 24,5.122 24,6.5 L24,17.5 C24,18.878 22.878,20 21.5,20 Z M1,10 L23,10 L23,8 L1,8 L1,10 Z M9.5,15 L3.5,15 C3.224,15 3,14.776 3,14.5 C3,14.224 3.224,14 3.5,14 L9.5,14 C9.776,14 10,14.224 10,14.5 C10,14.776 9.776,15 9.5,15 Z M9.5,17 L3.5,17 C3.224,17 3,16.776 3,16.5 C3,16.224 3.224,16 3.5,16 L9.5,16 C9.776,16 10,16.224 10,16.5 C10,16.776 9.776,17 9.5,17 Z M19.5,17 L18.5,17 C17.673,17 17,16.327 17,15.5 L17,14.5 C17,13.673 17.673,13 18.5,13 L19.5,13 C20.327,13 21,13.673 21,14.5 L21,15.5 C21,16.327 20.327,17 19.5,17 Z M18.5,14 C18.224,14 18,14.224 18,14.5 L18,15.5 C18,15.776 18.224,16 18.5,16 L19.5,16 C19.776,16 20,15.776 20,15.5 L20,14.5 C20,14.224 19.776,14 19.5,14 L18.5,14 Z"
})));
CreditCard.displayName = "DecorativeIcon";

const Cronometer = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "24",
  viewBox: "0 0 20 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-2)",
  d: "M13.0707296,3.415 L13.0707296,4.824 C12.7167296,4.785 12.3617296,4.765 12.0057296,4.765 C11.6507296,4.765 11.2947296,4.785 10.9417296,4.824 L10.9417296,3.415 L13.0707296,3.415 Z M19.4057296,14.378 C19.4057296,14.665 19.6387296,14.897 19.9247296,14.897 L20.5637296,14.897 C20.4937296,16.071 20.2007296,17.185 19.6877296,18.212 L19.1237296,17.887 C19.0027296,17.818 18.8647296,17.802 18.7287296,17.836 C18.5947296,17.871 18.4827296,17.957 18.4137296,18.078 C18.3427296,18.198 18.3267296,18.339 18.3617296,18.473 C18.3987296,18.607 18.4847296,18.719 18.6047296,18.789 L19.1677296,19.111 C18.8417296,19.602 18.4757296,20.053 18.0777296,20.45 C17.6787296,20.85 17.2287296,21.215 16.7387296,21.538 L16.4167296,20.977 C16.2717296,20.728 15.9537296,20.645 15.7057296,20.785 C15.4577296,20.929 15.3717296,21.246 15.5147296,21.495 L15.8407296,22.061 C14.8127296,22.572 13.6987296,22.866 12.5257296,22.936 L12.5257296,22.297 C12.5257296,22.01 12.2927296,21.777 12.0057296,21.777 C11.7187296,21.777 11.4867296,22.01 11.4867296,22.297 L11.4867296,22.936 C10.3137296,22.866 9.19972957,22.572 8.17272957,22.061 L8.49672957,21.495 C8.56572957,21.375 8.58472957,21.234 8.54872957,21.101 C8.51172957,20.967 8.42572957,20.855 8.30572957,20.785 C8.18472957,20.715 8.04572957,20.697 7.91072957,20.733 C7.77672957,20.769 7.66472957,20.856 7.59572957,20.977 L7.27372957,21.538 C6.78272957,21.216 6.33272957,20.851 5.93372957,20.45 C5.53472957,20.051 5.16872957,19.602 4.84572957,19.111 L5.40672957,18.789 C5.52772957,18.719 5.61372957,18.607 5.64972957,18.473 C5.68572957,18.338 5.66772957,18.199 5.59872957,18.078 C5.52872957,17.958 5.41672957,17.871 5.28272957,17.836 C5.14772957,17.798 5.00872957,17.816 4.88872957,17.887 L4.32372957,18.213 C3.81172957,17.184 3.51772957,16.07 3.44772957,14.897 L4.08672957,14.897 C4.37372957,14.897 4.60672957,14.665 4.60672957,14.378 C4.60672957,14.092 4.37372957,13.858 4.08672957,13.858 L3.44772957,13.858 C3.51772957,12.686 3.81172957,11.572 4.32372957,10.544 L4.88872957,10.869 C5.12672957,11.006 5.46072957,10.916 5.59872957,10.677 C5.66772957,10.557 5.68572957,10.417 5.64972957,10.283 C5.61272957,10.148 5.52772957,10.037 5.40672957,9.968 L4.84572957,9.645 C5.16872957,9.155 5.53472957,8.705 5.93372957,8.306 C6.33472957,7.905 6.78372957,7.54 7.27372957,7.218 L7.59572957,7.778 C7.73272957,8.019 8.06572957,8.106 8.30572957,7.971 C8.42572957,7.901 8.51172957,7.79 8.54872957,7.655 C8.58472957,7.521 8.56572957,7.381 8.49672957,7.261 L8.17272957,6.696 C9.19972957,6.184 10.3137296,5.89 11.4867296,5.821 L11.4867296,6.459 C11.4867296,6.746 11.7187296,6.978 12.0057296,6.978 C12.2927296,6.978 12.5257296,6.746 12.5257296,6.459 L12.5257296,5.821 C13.6987296,5.89 14.8117296,6.184 15.8407296,6.696 L15.5147296,7.261 C15.4447296,7.381 15.4267296,7.521 15.4637296,7.656 C15.5007296,7.79 15.5867296,7.901 15.7057296,7.971 C15.9417296,8.106 16.2767296,8.02 16.4167296,7.779 L16.7387296,7.218 C17.2277296,7.54 17.6777296,7.906 18.0777296,8.306 C18.4767296,8.705 18.8417296,9.155 19.1677296,9.645 L18.6047296,9.968 C18.4847296,10.037 18.3977296,10.149 18.3617296,10.283 C18.3267296,10.417 18.3427296,10.557 18.4137296,10.677 C18.5507296,10.918 18.8877296,11.003 19.1237296,10.869 L19.6877296,10.544 C20.2007296,11.572 20.4937296,12.685 20.5637296,13.858 L19.9247296,13.858 C19.6387296,13.858 19.4057296,14.092 19.4057296,14.378 L19.4057296,14.378 Z M8.96272957,2.375 L15.0497296,2.375 L15.0497296,1.039 L8.96272957,1.039 L8.96272957,2.375 Z M18.9767296,7.746 C22.5537296,11.505 22.4907296,17.507 18.8127296,21.186 C16.9977296,23.001 14.5797296,24 12.0057296,24 C9.43172957,24 7.01372957,23.001 5.19872957,21.186 C1.44572957,17.432 1.44572957,11.324 5.19872957,7.571 C6.48972957,6.281 8.11372957,5.391 9.90272957,4.993 L9.90272957,3.415 L8.44272957,3.415 C8.15072957,3.415 7.92272957,3.187 7.92272957,2.895 L7.92272957,0.519 C7.92272957,0.228 8.15072957,0 8.44272957,0 L15.5697296,0 C15.8617296,0 16.0897296,0.228 16.0897296,0.519 L16.0897296,2.895 C16.0897296,3.187 15.8617296,3.415 15.5697296,3.415 L14.1097296,3.415 L14.1097296,4.994 C15.6167296,5.329 17.0317296,6.033 18.2167296,7.036 L19.0397296,6.213 L18.8117296,5.987 C18.6097296,5.785 18.6097296,5.455 18.8117296,5.252 C19.0137296,5.05 19.3437296,5.048 19.5477296,5.252 L20.7357296,6.44 C20.9377296,6.642 20.9377296,6.972 20.7357296,7.175 C20.5377296,7.371 20.1967296,7.37 20.0007296,7.175 L19.7737296,6.948 L18.9767296,7.746 Z M12.5257296,13.7529 L12.5257296,9.2309 C12.5257296,8.9389 12.2967296,8.7109 12.0057296,8.7109 C11.7137296,8.7109 11.4857296,8.9389 11.4857296,9.2309 L11.4857296,13.9819 C11.4857296,14.1279 11.5487296,14.2729 11.6527296,14.3669 L16.0087296,18.3269 C16.1067296,18.4149 16.2287296,18.4609 16.3607296,18.4609 C16.5127296,18.4609 16.6457296,18.4029 16.7457296,18.2939 C16.8397296,18.1899 16.8897296,18.0559 16.8847296,17.9189 C16.8797296,17.7799 16.8197296,17.6519 16.7137296,17.5569 L12.5257296,13.7529 Z"
})));
Cronometer.displayName = "DecorativeIcon";

const CssActivations = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20px",
  height: "20px",
  viewBox: "0 0 20 20"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(4)",
  d: "M10.4166667,0 C11.565,0 12.5,0.935 12.5,2.08333333 L12.5,2.08333333 L12.5,17.9166667 C12.5,19.065 11.565,20 10.4166667,20 L10.4166667,20 L2.08333333,20 C0.935,20 0,19.065 0,17.9166667 L0,17.9166667 L0,2.08333333 C0,0.935 0.935,0 2.08333333,0 L2.08333333,0 Z M11.6666667,15.8333333 L0.833333333,15.8333333 L0.833333333,17.9166667 C0.833333333,18.6058333 1.39416667,19.1666667 2.08333333,19.1666667 L2.08333333,19.1666667 L10.4166667,19.1666667 C11.1058333,19.1666667 11.6666667,18.6058333 11.6666667,17.9166667 L11.6666667,17.9166667 L11.6666667,15.8333333 Z M6.25,16.6666667 C6.71,16.6666667 7.08333333,17.04 7.08333333,17.5 C7.08333333,17.96 6.71,18.3333333 6.25,18.3333333 C5.79,18.3333333 5.41666667,17.96 5.41666667,17.5 C5.41666667,17.04 5.79,16.6666667 6.25,16.6666667 Z M11.6666667,4.16666667 L0.833333333,4.16666667 L0.833333333,15 L11.6666667,15 L11.6666667,4.16666667 Z M9.02424516,7.12604165 C9.19230069,6.95798612 9.46477255,6.95798612 9.63282808,7.12604165 C9.80088362,7.29409719 9.80088362,7.56656904 9.63282808,7.73462458 L9.63282808,7.73462458 L5.39349432,11.9739583 C5.22543878,12.1420139 4.95296692,12.1420139 4.78491139,11.9739583 L4.78491139,11.9739583 L3.12604165,10.3150886 C2.95798612,10.1470331 2.95798612,9.87456122 3.12604165,9.70650568 C3.29409719,9.53845015 3.56656904,9.53845015 3.73462458,9.70650568 L3.73462458,9.70650568 L5.089,11.061 Z M10.4166667,0.833333333 L2.08333333,0.833333333 C1.39416667,0.833333333 0.833333333,1.39416667 0.833333333,2.08333333 L0.833333333,2.08333333 L0.833333333,3.33333333 L11.6666667,3.33333333 L11.6666667,2.08333333 C11.6666667,1.39416667 11.1058333,0.833333333 10.4166667,0.833333333 L10.4166667,0.833333333 Z M9.6,1.66666667 C9.83,1.66666667 10.0166667,1.85333333 10.0166667,2.08333333 C10.0166667,2.31333333 9.83,2.5 9.6,2.5 C9.37,2.5 9.17916667,2.31333333 9.17916667,2.08333333 C9.17916667,1.85333333 9.36166667,1.66666667 9.59166667,1.66666667 L9.59166667,1.66666667 Z M7.08333333,1.66666667 C7.31333333,1.66666667 7.5,1.85333333 7.5,2.08333333 C7.5,2.31333333 7.31333333,2.5 7.08333333,2.5 L7.08333333,2.5 L5.41666667,2.5 C5.18666667,2.5 5,2.31333333 5,2.08333333 C5,1.85333333 5.18666667,1.66666667 5.41666667,1.66666667 L5.41666667,1.66666667 Z"
})));
CssActivations.displayName = "DecorativeIcon";

const DataLimit = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M16.9519,14.1982 C16.9579,14.3362 16.9089,14.4692 16.8149,14.5692 C16.6269,14.7712 16.2809,14.7872 16.0809,14.5962 L14.8939,13.5032 L14.8939,22.6882 C14.8939,22.9952 14.6809,23.2082 14.3759,23.2082 C14.0689,23.2082 13.8549,22.9952 13.8549,22.6882 L13.8549,13.5712 L12.7629,14.6652 C12.5669,14.8592 12.2239,14.8592 12.0279,14.6652 C11.8259,14.4622 11.8259,14.1312 12.0279,13.9272 L14.0079,11.9492 C14.0309,11.9252 14.0569,11.9102 14.0759,11.9002 L14.1029,11.8822 C14.1189,11.8702 14.1409,11.8532 14.1699,11.8412 C14.2039,11.8262 14.2359,11.8212 14.2629,11.8172 C14.3139,11.8052 14.3409,11.7992 14.3729,11.7992 C14.4019,11.7992 14.4289,11.8042 14.4509,11.8092 L14.4699,11.9382 L14.4849,11.8152 C14.5049,11.8182 14.5319,11.8222 14.5609,11.8332 C14.5919,11.8442 14.6169,11.8622 14.6389,11.8762 L14.6659,11.8932 C14.6809,11.9022 14.7049,11.9142 14.7279,11.9362 L16.7859,13.8352 C16.8889,13.9292 16.9469,14.0582 16.9519,14.1982 Z M11.2366,20.3418 C11.4396,20.1408 11.7686,20.1408 11.9716,20.3418 C12.0696,20.4408 12.1236,20.5708 12.1236,20.7088 C12.1236,20.8488 12.0696,20.9788 11.9716,21.0768 L9.9916,23.0568 C9.8936,23.1548 9.7636,23.2078 9.6246,23.2078 C9.4866,23.2078 9.3556,23.1548 9.2576,23.0568 L7.2786,21.0768 C7.1796,20.9788 7.1256,20.8488 7.1256,20.7088 C7.1256,20.5708 7.1796,20.4408 7.2786,20.3418 C7.4806,20.1408 7.8096,20.1408 8.0126,20.3418 L9.1056,21.4338 L9.1056,12.3958 C9.1056,12.0898 9.3186,11.8768 9.6246,11.8768 C9.9306,11.8768 10.1446,12.0898 10.1446,12.3958 L10.1446,21.4338 L11.2366,20.3418 Z M18.91,6.7358 C21.818,6.9438 24,9.2248 24,12.0788 C23.919,15.1608 21.448,17.6658 18.492,17.6658 L17.225,17.6658 C16.92,17.6658 16.706,17.4518 16.706,17.1468 C16.706,16.8398 16.92,16.6268 17.225,16.6268 L18.492,16.6268 C20.912,16.6268 22.882,14.5858 22.882,12.0788 C22.882,9.6178 20.953,7.6898 18.492,7.6898 C18.21,7.6898 17.893,7.5018 17.893,7.2498 C17.43,4.1688 14.69,1.8308 11.525,1.8308 C7.926,1.8308 4.997,4.7238 4.997,8.2788 C4.997,8.5938 4.997,8.8208 5.075,9.2048 C5.077,9.3228 5.077,9.5178 4.961,9.6328 C4.847,9.7488 4.651,9.7488 4.557,9.7488 L4.478,9.7488 C2.582,9.7488 1.039,11.2918 1.039,13.1878 C1.039,15.0838 2.582,16.6268 4.478,16.6268 L6.774,16.6268 C7.08,16.6268 7.294,16.8398 7.294,17.1468 C7.294,17.4518 7.08,17.6658 6.774,17.6658 L4.478,17.6658 C2.051,17.6658 4.54747351e-13,15.6138 4.54747351e-13,13.1878 C4.54747351e-13,10.8788 1.691,9.0168 4.038,8.7228 L4.038,8.1998 C4,6.2668 4.73,4.4348 6.093,3.0448 C7.518,1.5918 9.447,0.7918 11.525,0.7918 C15.052,0.7918 18.142,3.2858 18.91,6.7358 Z"
})));
DataLimit.displayName = "DecorativeIcon";

const Deals = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M19.5068,6.0258 C19.9288,5.6028 19.9288,4.9158 19.5068,4.4928 C19.2948,4.2808 19.0178,4.1748 18.7398,4.1748 C18.4628,4.1748 18.1858,4.2808 17.9738,4.4928 C17.5508,4.9158 17.5508,5.6028 17.9738,6.0258 C18.3978,6.4478 19.0828,6.4478 19.5068,6.0258 Z M17.2638,3.7828 C18.0768,2.9678 19.4028,2.9678 20.2158,3.7828 C21.0298,4.5968 21.0298,5.9218 20.2158,6.7348 C19.8098,7.1428 19.2748,7.3458 18.7398,7.3458 C18.2058,7.3458 17.6708,7.1428 17.2638,6.7348 C16.4488,5.9218 16.4488,4.5968 17.2638,3.7828 Z M22.997,10.5 L22.997,2.503 C22.994,1.679 22.32,1.006 21.496,1.003 L13.5,1.003 L13.489,1.003 C13.099,1.003 12.721,1.163 12.45,1.441 C12.408,1.483 12.38,1.509 12.353,1.543 L1.433,12.457 C1.159,12.723 1.004,13.096 1.004,13.499 C1.004,13.901 1.16,14.273 1.442,14.549 L9.444,22.554 C9.721,22.837 10.1,22.997 10.489,22.997 L10.497,22.997 C10.855,22.989 11.276,22.839 11.551,22.558 L22.554,11.555 C22.841,11.275 22.997,10.902 22.997,10.5 Z M21.498,0 C22.873,0.004 23.995,1.125 24,2.5 L24,2.501 L24,10.5 C24,11.175 23.736,11.803 23.259,12.269 L12.265,23.264 C11.809,23.73 11.168,24 10.51,24 L10.483,24 C9.831,24 9.191,23.73 8.73,23.26 L0.737,15.264 C0.264,14.803 0,14.174 0,13.499 C0,12.822 0.264,12.194 0.743,11.729 L0.891,11.592 L11.605,0.876 C11.62,0.853 11.672,0.799 11.739,0.733 C12.189,0.27 12.829,0 13.486,0 L13.503,0 L21.498,0 Z"
})));
Deals.displayName = "DecorativeIcon";

const Delivery = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M23.9714658,13.332 L21.9454658,7.659 C21.5914658,6.667 20.6444658,6 19.5914658,6 L16.0004658,6 L16.0004658,4.5 C16.0004658,3.122 14.8784658,2 13.5004658,2 L2.50046581,2 C1.12246581,2 0.00046581459,3.122 0.00046581459,4.5 L0.00046581459,18.5 C0.00046581459,19.327 0.674465815,20 1.50046581,20 L3.05146581,20 C3.28346581,21.139 4.29446581,22 5.50046581,22 C6.70646581,22 7.71746581,21.139 7.94946581,20 L17.0504658,20 C17.2824658,21.139 18.2934658,22 19.4994658,22 C20.7054658,22 21.7164658,21.139 21.9484658,20 L22.5004658,20 C23.3274658,20 24.0004658,19.327 23.9994658,18.5 L23.9994658,13.5 C24.0004658,13.443 23.9904658,13.386 23.9714658,13.332 Z M1.00046581,4.5 C1.00046581,3.673 1.67446581,3 2.50046581,3 L13.5004658,3 C14.3284658,3 15.0004658,3.673 15.0004658,4.5 L15.0004658,15 L1.00046581,15 L1.00046581,4.5 Z M5.50046581,21 C4.67446581,21 4.00046581,20.327 4.00046581,19.5 C4.00046581,18.673 4.67446581,18 5.50046581,18 C6.32846581,18 7.00046581,18.673 7.00046581,19.5 C7.00046581,20.327 6.32846581,21 5.50046581,21 Z M19.5004658,21 C18.6734658,21 18.0004658,20.327 18.0004658,19.5 C18.0004658,18.673 18.6734658,18 19.5004658,18 C20.3274658,18 21.0004658,18.673 21.0004658,19.5 C21.0004658,20.327 20.3284658,21 19.5004658,21 Z M23.0004658,18.5 C23.0004658,18.776 22.7764658,19 22.5004658,19 L21.9504658,19 C21.7184658,17.861 20.7074658,17 19.5014658,17 C18.2954658,17 17.2844658,17.861 17.0524658,19 L7.95046581,19 C7.71846581,17.861 6.70746581,17 5.50146581,17 C4.29546581,17 3.28446581,17.861 3.05246581,19 L1.50046581,19 C1.22446581,19 1.00046581,18.776 1.00046581,18.5 L1.00046581,16 L15.5004658,16 C15.7764658,16 16.0004658,15.776 16.0004658,15.5 L16.0004658,7 L19.5904658,7 C20.2224658,7 20.7904658,7.4 21.0034658,7.995 L23.0004658,13.586 L23.0004658,18.5 Z M18.0004658,12 L18.0004658,8.5 C18.0004658,8.224 17.7764658,8 17.5004658,8 C17.2244658,8 17.0004658,8.224 17.0004658,8.5 L17.0004658,12.5 C17.0004658,12.776 17.2244658,13 17.5004658,13 L21.0004658,13 C21.2764658,13 21.5004658,12.776 21.5004658,12.5 C21.5004658,12.224 21.2764658,12 21.0004658,12 L18.0004658,12 Z"
})));
Delivery.displayName = "DecorativeIcon";

const Devices = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M12.9946,6.6162 C12.9946,6.0292 13.4006,5.5532 13.9006,5.5532 L22.0556,5.5532 C22.5546,5.5532 22.9606,6.0292 22.9606,6.6162 L22.9606,6.8882 L12.9946,6.8882 L12.9946,6.6162 Z M12.9946,20.6652 L22.9606,20.6652 L22.9606,7.9282 L12.9946,7.9282 L12.9946,20.6652 Z M12.9946,21.7032 L22.9606,21.7032 L22.9606,21.9762 C22.9606,22.4652 22.6496,22.9612 22.0556,22.9612 L13.9006,22.9612 C13.4006,22.9612 12.9946,22.4832 12.9946,21.8962 L12.9946,21.7032 Z M22.0556,4.5132 C23.1266,4.5132 23.9996,5.4562 23.9996,6.6162 L23.9996,21.9762 C23.9996,23.1302 23.1636,24.0002 22.0556,24.0002 L13.9006,24.0002 C13.3466,24.0002 12.8486,23.7452 12.4946,23.3432 C12.5056,23.3872 12.5196,23.4292 12.5196,23.4802 C12.5196,23.7862 12.3056,24.0002 11.9996,24.0002 L2.1026,24.0002 C0.9236,24.0002 -0.0004,23.0762 -0.0004,21.8962 L-0.0004,2.1032 C-0.0004,0.9242 0.9236,0.0002 2.1026,0.0002 L15.5626,0.0002 C16.7416,0.0002 17.6656,0.9242 17.6656,2.1032 L17.6656,3.6862 C17.6656,3.9922 17.4526,4.2062 17.1466,4.2062 C16.8396,4.2062 16.6266,3.9922 16.6266,3.6862 L16.6266,2.1032 C16.6266,1.5362 16.1296,1.0392 15.5626,1.0392 L2.1026,1.0392 C1.5366,1.0392 1.0386,1.5362 1.0386,2.1032 L1.0386,21.8962 C1.0386,22.4642 1.5366,22.9612 2.1026,22.9612 L11.9996,22.9612 C12.1046,22.9612 12.1936,22.9932 12.2716,23.0392 C12.0736,22.7102 11.9556,22.3182 11.9556,21.8962 L11.9556,6.6162 C11.9556,5.4562 12.8276,4.5132 13.9006,4.5132 L22.0556,4.5132 Z M18.7295,5.7007 L17.9385,5.7007 C17.6515,5.7007 17.4175,5.9337 17.4175,6.2207 C17.4175,6.5067 17.6515,6.7397 17.9385,6.7397 L18.7295,6.7397 C19.0165,6.7397 19.2505,6.5067 19.2505,6.2207 C19.2505,5.9337 19.0165,5.7007 18.7295,5.7007 Z M15.5625,4.2061 C15.2565,4.2061 15.0435,3.9931 15.0435,3.6861 L15.0435,2.6231 L2.6225,2.6231 L2.6225,19.7941 L10.8125,19.7941 C11.1185,19.7941 11.3325,20.0081 11.3325,20.3131 C11.3325,20.6191 11.1185,20.8331 10.8125,20.8331 L2.1035,20.8331 C1.7975,20.8331 1.5835,20.6191 1.5835,20.3131 L1.5835,2.1031 C1.5835,1.7971 1.7975,1.5831 2.1035,1.5831 L15.5625,1.5831 C15.8695,1.5831 16.0825,1.7971 16.0825,2.1031 L16.0825,3.6861 C16.0825,3.9931 15.8695,4.2061 15.5625,4.2061 Z M8.1855,21.249 C8.5415,20.895 9.1235,20.893 9.4805,21.249 C9.8365,21.607 9.8365,22.186 9.4805,22.545 C9.3025,22.723 9.0675,22.811 8.8335,22.811 C8.5985,22.811 8.3645,22.723 8.1855,22.545 C7.8295,22.186 7.8295,21.607 8.1855,21.249 Z"
})));
Devices.displayName = "DecorativeIcon";

const Diagram = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M1.4385,22.958 L8.3135,22.958 L8.3135,16.083 L1.4385,16.083 L1.4385,22.958 Z M8.5635,7.917 L15.4385,7.917 L15.4385,1.042 L8.5635,1.042 L8.5635,7.917 Z M15.6875,22.958 L22.5615,22.958 L22.5615,16.083 L15.6875,16.083 L15.6875,22.958 Z M23.0835,15.041 L19.6455,15.041 L19.6455,14.374 C19.6455,12.949 18.5715,11.875 17.1465,11.875 L12.5215,11.875 L12.5215,8.958 L15.9595,8.958 C16.2665,8.958 16.4795,8.744 16.4795,8.438 L16.4795,0.521 C16.4795,0.214 16.2665,0 15.9595,0 L8.0425,0 C7.7355,0 7.5215,0.214 7.5215,0.521 L7.5215,8.438 C7.5215,8.744 7.7355,8.958 8.0425,8.958 L11.4795,8.958 L11.4795,11.875 L6.8545,11.875 C5.4295,11.875 4.3545,12.949 4.3545,14.374 L4.3545,15.041 L0.9175,15.041 C0.6105,15.041 0.3965,15.255 0.3965,15.562 L0.3965,23.479 C0.3965,23.786 0.6105,24 0.9175,24 L8.8335,24 C9.1405,24 9.3545,23.786 9.3545,23.479 L9.3545,15.562 C9.3545,15.255 9.1405,15.041 8.8335,15.041 L5.3965,15.041 L5.3965,14.374 C5.3965,13.571 6.0505,12.917 6.8545,12.917 L17.1465,12.917 C17.9495,12.917 18.6035,13.571 18.6035,14.374 L18.6035,15.041 L15.1675,15.041 C14.8605,15.041 14.6455,15.255 14.6455,15.562 L14.6455,23.479 C14.6455,23.786 14.8605,24 15.1675,24 L23.0835,24 C23.3905,24 23.6035,23.786 23.6035,23.479 L23.6035,15.562 C23.6035,15.255 23.3905,15.041 23.0835,15.041 L23.0835,15.041 Z"
})));
Diagram.displayName = "DecorativeIcon";

const Diamond = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M7.99 5.75h8.02l-2.45-3.833h-3.12L7.99 5.75zm.078 1L12 21.346 15.932 6.75H8.068zm13.387-1l-4.773-3.833H14.46l2.41 3.77c.013.02.023.041.032.063h4.553zm.313 1h-5.053L13.01 20.496 21.768 6.75zm-19.223-1h4.553a.376.376 0 0 1 .033-.063l2.409-3.77H7.318L2.545 5.75zm-.313 1l8.755 13.743L7.285 6.75H2.232zM13.67 1h3.157a.38.38 0 0 1 .235.082l5.793 4.631a.39.39 0 0 1 .083.515l-10.62 16.596a.378.378 0 0 1-.636 0L1.062 6.228a.39.39 0 0 1 .083-.515l5.793-4.631A.379.379 0 0 1 7.173 1h6.497z",
  fillRule: "nonzero"
})));
Diamond.displayName = "DecorativeIcon";

const Direction = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "24",
  viewBox: "0 0 22 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1)",
  d: "M17.0135,2.895 C17.0135,2.728 17.0135,2.606 16.8985,2.491 L15.4465,1.04 L21.5155,1.04 L21.5155,7.109 L20.0655,5.658 C19.9645,5.558 19.8345,5.503 19.7005,5.503 L19.6995,5.503 C19.5645,5.503 19.4355,5.559 19.3355,5.658 L13.0005,11.992 L12.9665,12.029 L12.9655,12.08 C12.9655,12.1 12.9445,12.162 12.9315,12.199 C12.9085,12.27 12.8865,12.336 12.8865,12.396 L12.8865,22.961 L9.1735,22.961 L9.0965,10.707 L16.8195,3.3 C16.9055,3.212 17.0135,3.105 17.0135,2.895 L17.0135,2.895 Z M8.6615,9.695 L2.6545,3.687 L5.0925,1.249 L11.1525,7.309 L8.6615,9.695 Z M22.1155,0 L14.1985,0 C13.8875,0 13.7775,0.133 13.6915,0.38 C13.5815,0.533 13.6855,0.817 13.7925,0.924 L15.7625,2.893 L11.8975,6.596 L5.4175,0.116 L5.3855,0.093 C5.1945,-0.002 4.8945,-0.012 4.6885,0.195 L1.5215,3.362 C1.3135,3.57 1.3135,3.883 1.5215,4.091 L8.1355,10.706 L8.1355,23.481 C8.1355,23.787 8.3495,24 8.6555,24 L13.4065,24 C13.6125,24 13.8905,23.817 13.9915,23.615 L14.0045,12.685 L19.8195,6.871 L21.7905,8.842 C21.9125,8.964 22.1275,9.046 22.3285,8.944 C22.5175,8.851 22.6345,8.656 22.6345,8.437 L22.6345,0.52 C22.6345,0.214 22.4205,0 22.1155,0 L22.1155,0 Z"
})));
Direction.displayName = "DecorativeIcon";

const Document = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M20.5,24 L3.5,24 C3.224,24 3,23.776 3,23.5 L3,6.5 C3,6.367 3.053,6.24 3.146,6.146 L9.146,0.146 C9.24,0.053 9.367,0 9.5,0 L20.5,0 C20.776,0 21,0.224 21,0.5 L21,23.5 C21,23.776 20.776,24 20.5,24 Z M4,7 L4,23 L20,23 L20,1 L10,1 L10,6.5 C10,6.776 9.776,7 9.5,7 L4,7 Z M4.707,6 L9,6 L9,1.707 L4.707,6 Z M17.5,6 L12.5,6 C12.224,6 12,5.776 12,5.5 C12,5.224 12.224,5 12.5,5 L17.5,5 C17.776,5 18,5.224 18,5.5 C18,5.776 17.776,6 17.5,6 Z M17.5,9 L6.5,9 C6.224,9 6,8.776 6,8.5 C6,8.224 6.224,8 6.5,8 L17.5,8 C17.776,8 18,8.224 18,8.5 C18,8.776 17.776,9 17.5,9 Z M17.5,12 L6.5,12 C6.224,12 6,11.776 6,11.5 C6,11.224 6.224,11 6.5,11 L17.5,11 C17.776,11 18,11.224 18,11.5 C18,11.776 17.776,12 17.5,12 Z M17.5,15 L6.5,15 C6.224,15 6,14.776 6,14.5 C6,14.224 6.224,14 6.5,14 L17.5,14 C17.776,14 18,14.224 18,14.5 C18,14.776 17.776,15 17.5,15 Z M17.5,18 L6.5,18 C6.224,18 6,17.776 6,17.5 C6,17.224 6.224,17 6.5,17 L17.5,17 C17.776,17 18,17.224 18,17.5 C18,17.776 17.776,18 17.5,18 Z M17.5,21 L6.5,21 C6.224,21 6,20.776 6,20.5 C6,20.224 6.224,20 6.5,20 L17.5,20 C17.776,20 18,20.224 18,20.5 C18,20.776 17.776,21 17.5,21 Z"
})));
Document.displayName = "DecorativeIcon";

const Donate = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M1.485 11.993c.944.057 4.086.298 4.871 1.044a.458.458 0 01.141.374 9.36 9.36 0 01-.034.327l-.024.172 7.95 1.771c1.281.322 1.957.945 2.138 1.98l.027.187 2.971-.744a2.993 2.993 0 013.426 1.581.46.46 0 01-.155.59l-.065.035-5.04 2.3c-2.395.981-3.484 1.39-4.413 1.39-.531 0-1.01-.134-1.65-.369l-.249-.093-6.568-2.195c-.093.3-.156.491-.168.528a.457.457 0 01-.351.31l-.084.008h-2.75a.459.459 0 01-.45-.377L1 20.73v-8.278a.457.457 0 01.485-.458zm12.693 4.584l-7.894-1.76c-.273 1.4-.732 3.06-1.096 4.29l-.107.356 6.605 2.21c1.608.612 1.776.673 5.343-.787l.296-.122 4.544-2.072a2.077 2.077 0 00-1.96-.73l-.162.033-3.512.881h-.005l-1.229.31a3.193 3.193 0 01-1.2.069l-.207-.035-3.977-.799a.458.458 0 01-.359-.54.457.457 0 01.457-.37l.082.008 3.975.8c.265.053.54.057.807.014l.198-.04.88-.22c-.052-.787-.415-1.19-1.296-1.446l-.183-.05-7.894-1.76zM1.915 12.945v7.324h1.958c.341-1.08 1.44-4.658 1.683-6.672-.578-.28-2.168-.536-3.64-.652zM17.771 1.042c1.412.24 2.477 1.609 2.477 3.185 0 .831-.258 1.55-.732 2.113l-.135.149-4.302 4.487a.46.46 0 01-.59.059l-.07-.06-4.302-4.486a3.118 3.118 0 01-.868-2.176c0-1.662 1.067-3.031 2.48-3.271a2.924 2.924 0 012.386.655c.252.214.465.465.635.744.169-.28.382-.53.635-.744a2.916 2.916 0 012.386-.655zm-5.541.877c-.115 0-.232.01-.348.03-.978.165-1.716 1.145-1.716 2.278 0 .586.176 1.094.488 1.484l.123.14 3.972 4.142 3.973-4.142c.388-.404.61-.964.61-1.538 0-1.218-.738-2.2-1.715-2.363a1.988 1.988 0 00-1.641.449 2.203 2.203 0 00-.77 1.689.459.459 0 11-.916 0c0-.66-.28-1.275-.767-1.69a1.99 1.99 0 00-1.293-.48z"
})));
Donate.displayName = "DecorativeIcon";

const Download = props => {
  return /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M23.505,15.8693 C23.778,15.8693 24,16.0903 24,16.3633 L24,21.9183 C24,23.0663 23.067,24.0003 21.918,24.0003 L2.082,24.0003 C0.934,24.0003 -9.09494702e-13,23.0663 -9.09494702e-13,21.9183 L-9.09494702e-13,16.3633 C-9.09494702e-13,16.0903 0.221,15.8693 0.495,15.8693 C0.769,15.8693 0.99,16.0903 0.99,16.3633 L0.99,21.9183 C0.99,22.5203 1.48,23.0113 2.082,23.0113 L21.918,23.0113 C22.521,23.0113 23.011,22.5203 23.011,21.9183 L23.011,16.3633 C23.011,16.0903 23.232,15.8693 23.505,15.8693 Z M11.6642,16.7277 L6.5062,11.9667 C6.3062,11.7817 6.2932,11.4687 6.4792,11.2677 C6.6642,11.0667 6.9772,11.0547 7.1782,11.2397 L11.5052,15.2337 L11.5052,0.4947 C11.5052,0.2217 11.7262,-0.0003 12.0002,-0.0003 C12.2732,-0.0003 12.4952,0.2217 12.4952,0.4947 L12.4952,15.2337 L16.8222,11.2397 C17.0212,11.0547 17.3362,11.0687 17.5202,11.2677 C17.7062,11.4687 17.6932,11.7817 17.4922,11.9667 L12.3362,16.7277 C12.3132,16.7487 12.2862,16.7587 12.2602,16.7747 C12.2352,16.7897 12.2122,16.8107 12.1852,16.8217 C12.1252,16.8457 12.0632,16.8587 12.0002,16.8587 C11.9372,16.8587 11.8752,16.8457 11.8152,16.8217 C11.7882,16.8107 11.7652,16.7897 11.7402,16.7747 C11.7142,16.7587 11.6872,16.7487 11.6642,16.7277 Z"
  })));
};
Download.displayName = "DecorativeIcon";

const Email = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -3)",
  d: "M2.103,4.206 L21.896,4.206 C22.483,4.206 22.961,4.684 22.961,5.27 L22.961,6.554 L12.778,12.46 C12.299,12.737 11.702,12.737 11.223,12.461 L1.039,6.554 L1.039,5.27 C1.039,4.684 1.517,4.206 2.103,4.206 M13.298,13.36 L22.961,7.756 L22.961,18.729 C22.961,19.316 22.483,19.794 21.896,19.794 L2.103,19.794 C1.517,19.794 1.039,19.316 1.039,18.729 L1.039,7.756 L10.703,13.361 C11.492,13.815 12.51,13.813 13.298,13.36 M21.896,3.167 L2.103,3.167 C0.943,3.167 0,4.11 0,5.27 L0,18.729 C0,19.89 0.943,20.833 2.103,20.833 L21.896,20.833 C23.057,20.833 24,19.89 24,18.729 L24,5.27 C24,4.11 23.057,3.167 21.896,3.167"
})));
Email.displayName = "DecorativeIcon";

const Escalations = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20px",
  height: "20px",
  viewBox: "0 0 20 20"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(1)",
  d: "M4.474 1.892c.74 0 1.342.602 1.342 1.342 0 1.048.164 2.075.487 3.053a1.351 1.351 0 01-.332 1.37L4.553 9.541c1.166 2.198 2.583 3.614 4.798 4.796l1.93-1.457c.313-.319.853-.445 1.327-.281.973.321 2 .485 3.049.485.74 0 1.342.602 1.342 1.342v3.123c.001.74-.601 1.343-1.341 1.343C7.025 18.892 0 11.867 0 3.234c0-.74.602-1.342 1.342-1.342zm0 .894H1.342c-.246 0-.447.2-.447.448 0 8.14 6.623 14.763 14.763 14.763.246 0 .447-.2.447-.448v-3.122a.448.448 0 00-.447-.448c-1.144 0-2.266-.178-3.336-.532a.446.446 0 00-.455.107l-2.203 1.67a.445.445 0 01-.473.04c-2.627-1.344-4.238-2.957-5.564-5.563a.447.447 0 01.041-.473l1.628-2.156c.165-.17.207-.343.155-.508a10.65 10.65 0 01-.53-3.33.448.448 0 00-.447-.448zm13.992 4.65a.438.438 0 11.49.729l-3.92 2.63a.44.44 0 01-.676-.28h.001l-.099-.853-2.378 1.378a.438.438 0 01-.6-.16.439.439 0 01.16-.6l2.85-1.651a.44.44 0 01.651.295l.151.773zm-3.982-4.364a.44.44 0 01.781.4l-2.152 4.2a.438.438 0 01-.727.083l-.5-.698-1.411 2.359a.44.44 0 01-.754-.451l1.692-2.827a.439.439 0 01.713-.057l.506.603zM10.984 0l.075.004.079.019a.437.437 0 01.304.398l-.004.08-.661 4.672a.439.439 0 01-.66.316l-.7-.496-.564 2.69a.439.439 0 01-.86-.18l.675-3.224a.44.44 0 01.655-.287l.666.478.579-4.093a.439.439 0 01.34-.367l.077-.01z"
})));
Escalations.displayName = "DecorativeIcon";

const FavouriteNetwork = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M6.843 17h4.157v-5h-4.994c.047 1.814.349 3.524.836 5zm.374 1c.917 2.182 2.273 3.681 3.783 3.955v-3.955h-3.783zm-4.658-1h3.207c-.449-1.489-.718-3.184-.76-5h-3.994c.086 1.827.641 3.533 1.547 5zm.7 1c1.264 1.599 2.982 2.823 4.958 3.475-.847-.86-1.568-2.049-2.112-3.475h-2.847zm17.182-12h-3.207c.449 1.489.718 3.184.76 5h3.994c-.086-1.827-.641-3.533-1.547-5zm-.7-1c-1.264-1.599-2.982-2.823-4.958-3.475.847.86 1.568 2.049 2.112 3.475h2.847zm-3.584 1h-4.157v5h4.994c-.047-1.814-.349-3.524-.837-5zm-.374-1c-.918-2.182-2.273-3.681-3.783-3.955v3.955h3.783zm-8.94 1c-.488 1.476-.79 3.186-.837 5h4.994v-5h-4.157zm.374-1h3.783v-3.955c-1.51.274-2.866 1.773-3.783 3.955zm-4.658 1c-.906 1.467-1.461 3.173-1.547 5h3.994c.042-1.816.311-3.511.76-5h-3.207zm.7-1h2.847c.543-1.426 1.265-2.615 2.112-3.475-1.976.652-3.695 1.876-4.958 3.475zm18.728 7h-9.987v4.216h3.767l1.258-3.872c.134-.412.817-.412.951 0l1.258 3.872h4.071c.217 0 .409.14.476.346.067.206-.006.432-.182.559l-3.298 2.397 1.178 3.834c.063.206-.013.43-.188.555-.088.062-.19.093-.291.093-.104 0-.208-.032-.295-.097l-3.205-2.349-3.205 2.349c-.173.128-.41.129-.585.004-.176-.125-.251-.349-.188-.555l1.178-3.834-2.7-1.962v4.431c.22-.011.437-.029.654-.053.266-.028.521.168.551.443.03.275-.168.521-.443.551-.445.048-.857.072-1.262.072-6.341 0-11.5-5.159-11.5-11.5s5.158-11.5 11.5-11.5 11.5 5.159 11.5 11.5c0 .405-.023.818-.072 1.262-.03.274-.281.473-.551.443-.275-.03-.473-.277-.443-.551.024-.216.042-.434.053-.654zm-4.487 8.434c.104 0 .208.032.295.097l2.284 1.674-.84-2.734c-.063-.205.011-.426.184-.551l2.342-1.702h-2.896c-.217 0-.409-.14-.476-.346l-.895-2.753-.895 2.753c-.067.206-.259.346-.476.346h-2.896l2.342 1.702c.173.125.247.347.184.551l-.84 2.734 2.284-1.674c.091-.064.195-.097.299-.097z"
})));
FavouriteNetwork.displayName = "DecorativeIcon";

const Files = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "24",
  viewBox: "0 0 20 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-2)",
  d: "M20.5,23 L6.5,23 L6.5,21 L18,21 C18.276,21 18.5,20.776 18.5,20.5 L18.5,4 L20.5,4 L20.5,23 Z M3.5,7 L9,7 C9.276,7 9.5,6.776 9.5,6.5 L9.5,1 L17.5,1 L17.5,20 L3.5,20 L3.5,7 Z M8.5,1.707 L8.5,6 L4.207,6 L8.5,1.707 Z M21,3 L18.5,3 L18.5,0.5 C18.5,0.224 18.276,0 18,0 L9,0 C8.933,0 8.868,0.014 8.807,0.039 C8.778,0.051 8.756,0.073 8.73,0.09 C8.702,0.108 8.67,0.122 8.646,0.146 L2.646,6.146 C2.623,6.169 2.61,6.2 2.592,6.227 C2.574,6.254 2.552,6.277 2.539,6.307 C2.514,6.368 2.5,6.433 2.5,6.5 L2.5,20.5 C2.5,20.776 2.724,21 3,21 L5.5,21 L5.5,23.5 C5.5,23.776 5.724,24 6,24 L21,24 C21.276,24 21.5,23.776 21.5,23.5 L21.5,3.5 C21.5,3.224 21.276,3 21,3 L21,3 Z"
})));
Files.displayName = "DecorativeIcon";

const Fingerprint = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M17.0000832,2 C16.9310832,2 16.8600832,1.985 16.7930832,1.955 C15.4010832,1.321 13.7890832,1 12.0000832,1 C10.1990832,1 8.5870832,1.321 7.2090832,1.954 C6.9580832,2.069 6.6610832,1.96 6.5460832,1.709 C6.4310832,1.458 6.5410832,1.161 6.7910832,1.046 C8.3010832,0.352 10.0530832,0 12.0000832,0 C13.9330832,0 15.6850832,0.352 17.2070832,1.045 C17.4580832,1.159 17.5690832,1.456 17.4550832,1.707 C17.3720832,1.892 17.1900832,2 17.0000832,2 Z M5.0000832,6 C4.8740832,6 4.7470832,5.952 4.6490832,5.855 C4.4530832,5.662 4.4510832,5.345 4.6450832,5.148 C6.6790832,3.089 9.2220832,2 11.9980832,2 C14.7850832,2 17.3300832,3.089 19.3570832,5.149 C19.5510832,5.345 19.5480832,5.663 19.3510832,5.856 C19.1540832,6.049 18.8370832,6.046 18.6440832,5.85 C16.8090832,3.985 14.5100832,3 11.9980832,3 C9.4950832,3 7.1990832,3.986 5.3560832,5.852 C5.2580832,5.95 5.1290832,6 5.0000832,6 Z M19.9980832,13 C19.7220832,13 19.4980832,12.776 19.4980832,12.5 C19.4980832,8.364 16.1340832,5 11.9980832,5 C11.3680832,5 10.7420832,5.078 10.1400832,5.231 C9.8700832,5.3 9.5990832,5.139 9.5310832,4.87 C9.4630832,4.603 9.6240832,4.331 9.8920832,4.263 C10.5760832,4.088 11.2840832,4 11.9980832,4 C16.6850832,4 20.4980832,7.813 20.4980832,12.5 C20.4980832,12.776 20.2740832,13 19.9980832,13 Z M4.0000832,13 C3.9980832,13 3.9950832,13 3.9920832,13 C3.7160832,12.995 3.4950832,12.769 3.5000832,12.492 C3.5360832,10.213 4.4130832,8.092 5.9700832,6.518 C6.4970832,5.984 7.0900832,5.523 7.7300832,5.148 C7.9670832,5.009 8.2740832,5.088 8.4140832,5.327 C8.5530832,5.565 8.4730832,5.872 8.2350832,6.012 C7.6710832,6.342 7.1480832,6.749 6.6810832,7.222 C5.3060832,8.611 4.5320832,10.489 4.5000832,12.508 C4.4960832,12.781 4.2730832,13 4.0000832,13 Z M4.7190832,17.5 C4.6360832,17.5 4.5520832,17.479 4.4740832,17.436 C4.2330832,17.301 4.1480832,16.996 4.2830832,16.755 L4.5640832,16.255 C5.1660832,15.015 5.5020832,13.725 5.4990832,12.65 C5.4990832,10.828 6.1710832,9.16 7.3920832,7.925 C8.6180832,6.684 10.2540832,6 11.9980832,6 C13.8750832,6 15.6610832,6.813 16.8980832,8.232 C17.0790832,8.441 17.0580832,8.756 16.8500832,8.938 C16.6420832,9.118 16.3270832,9.098 16.1440832,8.89 C15.0970832,7.688 13.5850832,7 11.9980832,7 C10.5240832,7 9.1410832,7.578 8.1030832,8.628 C7.0690832,9.674 6.4990832,11.093 6.4990832,12.623 C6.5030832,13.889 6.1400832,15.297 5.4500832,16.719 L5.1550832,17.245 C5.0630832,17.408 4.8940832,17.5 4.7190832,17.5 Z M18.9480832,18.91 C18.7340832,18.91 18.5350832,18.771 18.4690832,18.556 L17.8970832,16.672 C17.5490832,15.091 17.5200832,13.648 17.5030832,12.785 L17.4970832,12.513 C17.4970832,11.873 17.3920832,11.257 17.1840832,10.67 C17.0920832,10.409 17.2280832,10.124 17.4880832,10.031 C17.7490832,9.94 18.0350832,10.076 18.1260832,10.336 C18.3720832,11.03 18.4970832,11.759 18.4970832,12.5 L18.5030832,12.766 C18.5200832,13.591 18.5470832,14.973 18.8640832,16.419 L19.4270832,18.265 C19.5070832,18.53 19.3580832,18.809 19.0940832,18.889 C19.0450832,18.903 18.9960832,18.91 18.9480832,18.91 Z M17.4900832,21.222 C17.2770832,21.222 17.0790832,21.085 17.0120832,20.87 L16.5500832,19.386 C15.7180832,16.789 15.5330832,13.965 15.4970832,12.513 C15.4970832,10.571 13.9270832,9 11.9970832,9 C10.0680832,9 8.4990832,10.602 8.4990832,12.57 C8.5020832,13.396 8.3390832,16.299 6.1140832,19.508 C5.9560832,19.734 5.6430832,19.789 5.4180832,19.634 C5.1910832,19.477 5.1340832,19.165 5.2920832,18.938 C7.4030832,15.893 7.5000832,13.113 7.4990832,12.587 C7.4990832,10.05 9.5170832,8 11.9980832,8 C14.4790832,8 16.4980832,10.019 16.4980832,12.5 C16.5260832,13.613 16.6800832,16.511 17.5040832,19.085 L17.9680832,20.573 C18.0500832,20.837 17.9030832,21.117 17.6390832,21.199 C17.5890832,21.215 17.5400832,21.222 17.4900832,21.222 Z M10.0070832,24 C9.9010832,24 9.7940832,23.966 9.7020832,23.896 C9.4830832,23.727 9.4430832,23.414 9.6110832,23.195 C13.5150832,18.123 13.5110832,13.071 13.4980832,12.511 C13.4980832,11.672 12.8240832,10.999 11.9970832,10.999 C11.1700832,10.999 10.4970832,11.672 10.4970832,12.499 C10.5030832,12.66 10.6250832,16.937 7.2320832,21.353 C7.0640832,21.572 6.7510832,21.613 6.5310832,21.445 C6.3120832,21.277 6.2710832,20.963 6.4390832,20.744 C9.6140832,16.611 9.5040832,12.683 9.4980832,12.517 C9.4980832,11.12 10.6190832,9.998 11.9980832,9.998 C13.3770832,9.998 14.4980832,11.119 14.4980832,12.498 C14.5130832,13.08 14.5240832,18.451 10.4040832,23.803 C10.3060832,23.933 10.1570832,24 10.0070832,24 Z M11.8340832,14.998 C11.8080832,14.998 11.7810832,14.996 11.7540832,14.992 C11.4820832,14.948 11.2960832,14.691 11.3400832,14.419 C11.5260832,13.26 11.4980832,12.529 11.4980832,12.522 C11.4860832,12.247 11.7000832,12.013 11.9760832,12.001 C12.2600832,12.01 12.4850832,12.201 12.4970832,12.478 C12.4980832,12.511 12.5320832,13.308 12.3280832,14.578 C12.2880832,14.823 12.0760832,14.998 11.8340832,14.998 Z M8.1950832,23.053 C8.0860832,23.053 7.9750832,23.017 7.8830832,22.944 C7.6670832,22.771 7.6320832,22.457 7.8040832,22.241 C9.2280832,20.46 10.2670832,18.485 10.8930832,16.373 C10.9720832,16.108 11.2510832,15.96 11.5150832,16.035 C11.7800832,16.113 11.9310832,16.391 11.8520832,16.656 C11.1890832,18.893 10.0900832,20.982 8.5850832,22.866 C8.4870832,22.988 8.3420832,23.053 8.1950832,23.053 Z M12.3730832,24 C12.2810832,24 12.1880832,23.975 12.1050832,23.922 C11.8720832,23.775 11.8030832,23.465 11.9510832,23.232 C13.2280832,21.222 14.3420832,18.604 14.3530832,18.578 C14.4350832,18.384 14.6210832,18.25 14.8420832,18.274 C15.0530832,18.286 15.2330832,18.429 15.2930832,18.632 C15.2940832,18.634 15.5180832,19.394 15.7580832,20.111 L16.3600832,22.028 C16.4430832,22.291 16.2960832,22.572 16.0330832,22.655 C15.7680832,22.739 15.4880832,22.59 15.4060832,22.327 L14.8070832,20.42 C14.7800832,20.341 14.7540832,20.26 14.7270832,20.18 C14.2690832,21.154 13.5680832,22.552 12.7940832,23.77 C12.7000832,23.918 12.5380832,24 12.3730832,24 Z"
})));
Fingerprint.displayName = "DecorativeIcon";

const Firewall = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "24",
  viewBox: "0 0 22 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1)",
  d: "M21.773,3.937 L21.773,14.533 C21.773,18.009 16.007,21.71 12,22.955 C7.992,21.71 2.226,18.009 2.226,14.533 L2.226,3.937 L12,1.044 L21.773,3.937 Z M22.407,3.014 C22.619,3.118 22.812,3.312 22.812,3.528 L22.812,14.533 C22.812,18.968 15.844,22.884 12.114,23.995 L12.097,24 L11.885,23.995 C8.155,22.884 1.188,18.968 1.188,14.533 L1.188,3.528 C1.188,3.387 1.24,3.131 1.588,3.015 L11.92,0 L12.114,0.005 L22.407,3.014 Z M6.7823,11.2788 C6.5743,11.0708 6.2603,11.0708 6.0533,11.2788 C5.8453,11.4868 5.8453,11.7998 6.0533,12.0078 L10.0113,15.9678 C10.1273,16.0818 10.3223,16.0818 10.4163,16.0818 C10.5203,16.0818 10.6623,16.0818 10.7083,15.9728 C10.7143,15.9598 10.7203,15.9378 10.7193,15.9088 L17.7873,8.8408 C17.8873,8.7408 17.9433,8.6118 17.9433,8.4758 C17.9433,8.3408 17.8873,8.2118 17.7873,8.1118 C17.5793,7.9048 17.2683,7.9038 17.0583,8.1118 L10.3363,14.8338 L6.7823,11.2788 Z"
})));
Firewall.displayName = "DecorativeIcon";

const Flag = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(-3)",
  d: "M4,24 C3.724,24 3.5,23.776 3.5,23.5 L3.5,0.5 C3.5,0.224 3.724,0 4,0 C4.276,0 4.5,0.224 4.5,0.5 L4.5,23.5 C4.5,23.776 4.276,24 4,24 Z M13.5,3 L13.5,6.5 C13.5,6.776 13.276,7 13,7 C12.724,7 12.5,6.776 12.5,6.5 L12.5,2.5 L12.5,1.5 C12.5,1.224 12.276,1 12,1 L4,1 C3.724,1 3.5,0.776 3.5,0.5 C3.5,0.224 3.724,0 4,0 L12,0 C12.827,0 13.5,0.673 13.5,1.5 L13.5,2 L20,2 C20.276,2 20.5,2.224 20.5,2.5 L20.5,13.5 C20.5,13.776 20.276,14 20,14 L14,14 C13.173,14 12.5,13.327 12.5,12.5 C12.5,12.224 12.276,12 12,12 L4,12 C3.724,12 3.5,11.776 3.5,11.5 C3.5,11.224 3.724,11 4,11 L12,11 C12.827,11 13.5,11.673 13.5,12.5 C13.5,12.776 13.724,13 14,13 L19.5,13 L19.5,3 L13.5,3 Z"
})));
Flag.displayName = "DecorativeIcon";

const Gift = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M23.0045,10.0225 C23.0045,10.6235 22.5145,11.1125 21.9125,11.1125 L21.1205,11.1125 L2.0865,11.1125 C1.4845,11.1125 0.9955,10.6235 0.9955,10.0225 L0.9955,6.8495 C0.9955,6.2485 1.4845,5.7595 2.0865,5.7595 L10.2475,5.7595 C9.4005,6.2025 8.4815,6.7305 7.9495,7.1875 C7.7415,7.3655 7.7175,7.6785 7.8955,7.8855 C7.9935,8.0005 8.1325,8.0595 8.2725,8.0595 C8.3865,8.0595 8.5015,8.0205 8.5945,7.9395 C9.3475,7.2945 11.0815,6.4305 11.9995,5.9945 C12.9185,6.4305 14.6515,7.2935 15.4045,7.9395 C15.4975,8.0205 15.6125,8.0595 15.7275,8.0595 C15.8665,8.0595 16.0065,8.0005 16.1045,7.8855 C16.2815,7.6785 16.2585,7.3655 16.0495,7.1875 C15.5185,6.7305 14.6005,6.2025 13.7525,5.7595 L21.9125,5.7595 C22.5145,5.7595 23.0045,6.2485 23.0045,6.8495 L23.0045,10.0225 Z M20.6245,21.9185 C20.6245,22.5195 20.1345,23.0075 19.5335,23.0075 L3.6725,23.0075 C3.0705,23.0075 2.5815,22.5195 2.5815,21.9185 L2.5815,12.1045 L20.6245,12.1045 L20.6245,21.9185 Z M7.7505,3.4855 C7.1495,2.8845 7.1495,2.0125 7.7505,1.4105 C8.0225,1.1395 8.3855,0.9905 8.7765,0.9905 C8.7875,0.9905 8.7975,0.9905 8.8075,0.9905 C9.1945,0.9985 9.5655,1.1515 9.8245,1.4105 C10.2175,1.8035 10.6775,3.3415 10.9655,4.6265 C9.6805,4.3385 8.1435,3.8785 7.7505,3.4855 L7.7505,3.4855 Z M14.1735,1.4105 C14.6765,0.9095 15.6295,0.7915 16.2495,1.4105 C16.8505,2.0125 16.8505,2.8845 16.2495,3.4855 C15.8565,3.8785 14.3185,4.3385 13.0335,4.6265 C13.3215,3.3415 13.7805,1.8035 14.1735,1.4105 L14.1735,1.4105 Z M21.9125,4.7685 L15.9965,4.7685 C16.3995,4.5925 16.7385,4.3975 16.9495,4.1865 C17.9415,3.1955 17.9405,1.7005 16.9495,0.7095 C16.0115,-0.2315 14.4175,-0.2335 13.4735,0.7095 C12.7535,1.4295 12.2185,3.6605 11.9995,4.7135 C11.7805,3.6605 11.2455,1.4295 10.5255,0.7095 C10.0875,0.2715 9.4685,0.0125 8.8265,-0.0005 C8.1835,0.0065 7.5205,0.2385 7.0495,0.7095 C6.0585,1.7005 6.0585,3.1955 7.0495,4.1865 C7.2605,4.3975 7.6005,4.5925 8.0035,4.7685 L2.0865,4.7685 C0.9385,4.7685 0.0045,5.7015 0.0045,6.8495 L0.0045,10.0225 C0.0045,10.9995 0.6815,11.8215 1.5905,12.0445 L1.5905,21.9185 C1.5905,23.0665 2.5245,24.0005 3.6725,24.0005 L19.5335,24.0005 C20.6825,24.0005 21.6155,23.0665 21.6155,21.9185 L21.6155,12.1045 L21.9125,12.1045 C23.0615,12.1045 23.9955,11.1705 23.9955,10.0225 L23.9955,6.8495 C23.9955,5.7015 23.0615,4.7685 21.9125,4.7685 L21.9125,4.7685 Z"
})));
Gift.displayName = "DecorativeIcon";

const Globe1 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M21.032806,18.2709198 C21.277824,16.8575263 21.3602386,15.1618172 21.095,14.793 C20.944,14.584 20.193,14.444 19.696,14.353 C19.133,14.249 18.6,14.15 18.238,13.926 C18.03,13.798 17.854,13.583 17.67,13.355 C17.563,13.223 17.383,13.002 17.304,12.959 C17.083,12.869 16.52,12.94 16.063,12.996 C15.402,13.079 14.78,13.156 14.31,12.962 C13.41,12.588 10.421,10.799 11.039,9.309 C11.304,8.673 12.069,8.84 12.63,8.961 C12.832,9.005 13.172,9.082 13.279,9.056 C13.659,8.815 14.024,7.789 14.317,6.965 C14.561,6.278 14.792,5.629 15.095,5.209 C15.222,5.033 15.423,4.891 15.636,4.74 C15.716,4.684 15.827,4.605 15.913,4.536 C15.738,4.467 15.38,4.359 15.168,4.295 C14.797,4.184 14.446,4.078 14.207,3.906 C14.033,3.781 13.891,3.585 13.739,3.377 C13.681,3.299 13.602,3.189 13.531,3.105 C13.491,3.162 13.451,3.225 13.42,3.272 C13.21,3.596 12.949,4 12.5,4 C11.809,4 11.178,3.027 11.038,2.692 C10.8591398,2.26115438 10.9136621,1.61938567 10.9632238,1.04845976 C9.13059364,1.220601 7.42717917,1.84433157 5.96574004,2.80689176 C6.33871202,2.84952122 6.69885552,2.92150283 6.905,3.207 C7.277,3.724 7.165,4.527 7.056,5.305 C7,5.71 6.936,6.17 6.986,6.385 C7.09,6.824 7.578,7.754 7.905,8.208 C8.334,8.802 9.29,9.5 10.301,10.238 C12.12,11.564 14,12.937 14,14.5 C14,14.949 13.596,15.21 13.271,15.42 C13.198,15.467 13.088,15.538 13.018,15.593 C13.143,15.926 13.864,16.432 14.356,16.778 C15.059,17.271 15.724,17.736 15.961,18.309 C16.216,18.924 16.142,20.103 15.978,20.645 C15.8219289,21.1619163 15.2621547,21.9823757 14.7626527,22.6486751 C17.3389839,21.9797488 19.5515171,20.398015 21.032806,18.2709198 Z M22.261394,15.9636558 C22.7383105,14.733333 23,13.3966269 23,12 C23,5.935 18.065,1 12,1 C11.9903558,1 11.9807145,1.00001248 11.9710761,1.00003742 C11.9678438,1.03771588 11.9644627,1.07608605 11.961,1.115 C11.929,1.483 11.875,2.1 11.962,2.309 C12.042,2.502 12.275,2.8 12.441,2.938 C12.489,2.871 12.543,2.789 12.581,2.729 C12.79,2.404 13.051,2 13.5,2 C13.973,2 14.277,2.418 14.547,2.787 C14.625,2.894 14.743,3.056 14.793,3.095 C14.895,3.168 15.206,3.262 15.455,3.337 C16.127,3.539 16.888,3.767 16.993,4.42 C17.079,4.947 16.598,5.285 16.212,5.558 C16.106,5.633 15.943,5.747 15.903,5.796 C15.685,6.099 15.468,6.71 15.257,7.301 C14.876,8.373 14.482,9.482 13.762,9.926 C13.398,10.152 12.92,10.049 12.415,9.939 C12.288,9.911 12.104,9.871 11.966,9.853 C12.137,10.39 13.581,11.58 14.691,12.04 C14.916,12.133 15.481,12.061 15.938,12.006 C16.598,11.923 17.222,11.846 17.691,12.04 C17.986,12.163 18.218,12.449 18.444,12.725 C18.545,12.849 18.697,13.036 18.762,13.077 C18.965,13.202 19.45,13.292 19.876,13.371 C20.685,13.52 21.52,13.675 21.905,14.21 C22.1740332,14.5832937 22.2616862,15.2506405 22.261394,15.9636558 Z M11.3735522,0.0161486407 C11.4139446,0.00561012503 11.4563211,0 11.5,0 C11.5287517,0 11.556939,0.00243083605 11.5843676,0.00709806622 C11.7223407,0.00237887026 11.8608977,0 12,0 C18.617,0 24,5.383 24,12 C24,14.4679914 23.2511594,16.7643184 21.9687519,18.6737073 C21.9396129,18.7532754 21.8912159,18.8221111 21.8300337,18.8757758 C19.6577592,21.9721553 16.0613114,24 12,24 C5.383,24 0,18.617 0,12 C0,5.59310433 5.04658293,0.343088346 11.3735522,0.0161486407 Z M13.2728164,22.9267967 C13.9140994,22.1462151 14.8634995,20.8752517 15.021,20.354 C15.144,19.947 15.173,19.018 15.038,18.69 C14.912,18.386 14.286,17.947 13.782,17.595 C12.906,16.981 12,16.346 12,15.5 C12,15.051 12.404,14.79 12.729,14.58 C12.807,14.53 12.926,14.453 12.995,14.397 C12.884,13.359 11.131,12.08 9.713,11.045 C8.635,10.258 7.616,9.515 7.096,8.792 C6.742,8.305 6.16,7.24 6.014,6.614 C5.92,6.217 5.991,5.707 6.066,5.167 C6.128,4.724 6.231,3.983 6.094,3.793 C6.092,3.824 5.84,3.798 5.688,3.783 C5.45541042,3.76000238 5.14141102,3.72880914 4.89464378,3.60931639 C2.51366501,5.62871609 1,8.64106104 1,12 C1,18.065 5.935,23 12,23 C12.4304165,23 12.855142,22.9751456 13.2728164,22.9267967 Z"
})));
Globe1.displayName = "DecorativeIcon";

const Globe2 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12,24 C5.38330435,24 -4.4408921e-14,18.6166957 -4.4408921e-14,12 C-4.4408921e-14,5.38330435 5.38330435,0 12,0 C18.6166957,0 24,5.38330435 24,12 C24,18.6166957 18.6166957,24 12,24 Z M12,1.04347826 C5.95826087,1.04347826 1.04347826,5.95826087 1.04347826,12 C1.04347826,18.0417391 5.95826087,22.9565217 12,22.9565217 C18.0417391,22.9565217 22.9565217,18.0417391 22.9565217,12 C22.9565217,5.95826087 18.0417391,1.04347826 12,1.04347826 Z M12.5217391,12.5217391 L12.5217391,17.7391304 L16.8593428,17.7391304 C17.3683252,16.1988372 17.6831738,14.4141867 17.7323571,12.5217391 L12.5217391,12.5217391 Z M11.4782609,12.5217391 L6.26764293,12.5217391 C6.31682621,14.4141867 6.63167479,16.1988372 7.14065717,17.7391304 L11.4782609,17.7391304 L11.4782609,12.5217391 Z M12.5217391,22.9092956 C14.0973755,22.6233291 15.5119511,21.059328 16.4693479,18.7826087 L12.5217391,18.7826087 L12.5217391,22.9092956 Z M11.4782609,22.9092956 L11.4782609,18.7826087 L7.53065208,18.7826087 C8.48804887,21.059328 9.90262449,22.6233291 11.4782609,22.9092956 Z M12.5217391,11.4782609 L17.7323571,11.4782609 C17.6831738,9.58581327 17.3683252,7.80116279 16.8593428,6.26086957 L12.5217391,6.26086957 L12.5217391,11.4782609 Z M11.4782609,11.4782609 L11.4782609,6.26086957 L7.14065717,6.26086957 C6.63167479,7.80116279 6.31682621,9.58581327 6.26764293,11.4782609 L11.4782609,11.4782609 Z M12.5217391,1.09070443 L12.5217391,5.2173913 L16.4693479,5.2173913 C15.5119511,2.94067197 14.0973755,1.3766709 12.5217391,1.09070443 Z M11.4782609,1.09070443 C9.90262449,1.3766709 8.48804887,2.94067197 7.53065208,5.2173913 L11.4782609,5.2173913 L11.4782609,1.09070443 Z M17.9832884,17.7391304 L21.6208696,17.7391304 C21.9088696,17.7391304 22.1426087,17.9728696 22.1426087,18.2608696 C22.1426087,18.5488696 21.909913,18.7826087 21.621913,18.7826087 L17.6284232,18.7826087 C16.4198794,21.9532212 14.3699709,24 12,24 C9.63002908,24 7.58012056,21.9532212 6.37157681,18.7826087 L2.37808696,18.7826087 C2.09008696,18.7826087 1.85634783,18.5488696 1.85634783,18.2608696 C1.85634783,17.9728696 2.09008696,17.7391304 2.37808696,17.7391304 L6.01671161,17.7391304 C5.54817268,16.1851644 5.26711643,14.4166142 5.22339394,12.5217391 L0.52173913,12.5217391 C0.23373913,12.5217391 -4.4408921e-14,12.288 -4.4408921e-14,12 C-4.4408921e-14,11.712 0.23373913,11.4782609 0.52173913,11.4782609 L5.22339394,11.4782609 C5.26711643,9.5833858 5.54817268,7.81483558 6.01671161,6.26086957 L2.37808696,6.26086957 C2.09008696,6.26086957 1.85634783,6.02713043 1.85634783,5.73913043 C1.85634783,5.45113043 2.09008696,5.2173913 2.37808696,5.2173913 L6.37157681,5.2173913 C7.58012056,2.04677877 9.63002908,0 12,0 C14.3699709,0 16.4198794,2.04677877 17.6284232,5.2173913 L21.6208696,5.2173913 C21.9088696,5.2173913 22.1426087,5.45113043 22.1426087,5.73913043 C22.1426087,6.02713043 21.909913,6.26086957 21.621913,6.26086957 L17.9832884,6.26086957 C18.4518273,7.81483558 18.7328836,9.5833858 18.7766061,11.4782609 L23.4782609,11.4782609 C23.7662609,11.4782609 24,11.712 24,12 C24,12.288 23.7662609,12.5217391 23.4782609,12.5217391 L18.7766061,12.5217391 C18.7328836,14.4166142 18.4518273,16.1851644 17.9832884,17.7391304 Z"
})));
Globe2.displayName = "DecorativeIcon";

const HeadBoth = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -3)",
  d: "M20.74125,16.2205989 C22.66025,16.6895989 24.00025,18.3735989 24.00025,20.3165989 C24.00025,20.6055989 23.76625,20.8405989 23.47925,20.8405989 L19.52025,20.8405989 C19.23325,20.8405989 19.00025,20.6065989 19.00025,20.3195989 C19.00025,20.0325989 19.23325,19.7985989 19.52025,19.7985989 L22.91525,19.7985989 C22.70525,18.5445989 21.76825,17.5455989 20.49325,17.2325989 L17.45425,16.4885989 C17.26625,16.4425989 17.12125,16.2975989 17.07325,16.1115989 L16.75825,14.8765989 C16.72125,14.7325989 16.74825,14.5785989 16.83025,14.4565989 C16.91425,14.3325989 17.04625,14.2505989 17.19125,14.2315989 C18.31925,14.0765989 19.14925,13.8245989 19.68025,13.6225989 C19.21325,12.9325989 18.53225,11.4625989 18.53225,8.75359888 C18.53225,7.60559888 18.40325,4.93759888 17.20825,4.93759888 L16.84025,4.93759888 C16.70125,4.93759888 16.57125,4.88459888 16.47425,4.78759888 C16.01925,4.34359888 15.89725,4.22359888 15.22125,4.20459888 C15.04825,4.24059888 14.84725,4.15659888 14.73225,3.98159888 C14.62525,3.82159888 14.61325,3.60759888 14.70625,3.43859888 C14.81225,3.24159888 14.99425,3.13959888 15.18025,3.16259888 C16.12525,3.17659888 16.51725,3.39059888 17.04925,3.89559888 L17.20825,3.89559888 C18.77725,3.89559888 19.57325,5.53059888 19.57325,8.75359888 C19.57325,12.3265989 20.82725,13.3865989 20.84025,13.3975989 C20.97825,13.4985989 21.05725,13.6655989 21.04825,13.8425989 C21.03925,14.0175989 20.94225,14.1755989 20.78925,14.2635989 C20.74925,14.2865989 19.79325,14.8385989 17.90825,15.1725989 L18.00525,15.5495989 L20.74125,16.2205989 Z M6.92775,16.1101989 C6.87975,16.2971989 6.73375,16.4411989 6.54775,16.4871989 L3.50575,17.2311989 C2.23075,17.5461989 1.29375,18.5461989 1.08475,19.7981989 L16.92575,19.7981989 C16.71575,18.5451989 15.77975,17.5461989 14.50375,17.2321989 L11.46375,16.4881989 C11.27675,16.4431989 11.13175,16.2981989 11.08375,16.1121989 L10.73675,14.7541989 C10.68775,14.5631989 10.74875,14.3641989 10.89675,14.2331989 C11.64975,13.5721989 12.14675,12.5891989 12.22575,11.6041989 C12.24775,11.3301989 12.47075,11.1241989 12.74375,11.1241989 C12.88075,11.1241989 12.98175,11.0521989 12.99575,10.9451989 L13.18075,9.50119888 C13.18775,9.44619888 13.17175,9.39519888 13.13375,9.35219888 C13.09275,9.30419888 13.03275,9.27719888 12.96575,9.27619888 C12.82675,9.27619888 12.69075,9.21619888 12.59375,9.11319888 C12.49675,9.00819888 12.44575,8.86919888 12.45275,8.72919888 L12.54275,6.92019888 C12.54875,6.79019888 12.60375,6.66819888 12.69775,6.57519888 L13.06675,6.21319888 C13.27875,5.99119888 13.41875,5.69619888 12.99775,5.06719888 C12.62075,4.50119888 11.92975,4.21419888 10.94575,4.21419888 C10.21275,4.21419888 9.35575,4.28919888 8.56575,4.84319888 C8.48075,4.90219888 8.37675,4.93619888 8.27175,4.93719888 C5.67875,4.96219888 5.46775,5.86219888 5.46775,6.94619888 C5.46775,7.27219888 5.58175,8.25919888 5.63775,8.68619888 C5.65775,8.83519888 5.61175,8.98519888 5.51075,9.09719888 C5.41275,9.21019888 5.27075,9.27419888 5.12075,9.27419888 C4.96375,9.27419888 4.90875,9.31119888 4.87675,9.34819888 C4.85575,9.37319888 4.82075,9.42519888 4.82975,9.49919888 L5.01275,10.9451989 C5.02575,11.0471989 5.11875,11.1231989 5.22875,11.1231989 L5.34975,11.1231989 C5.62075,11.1231989 5.84775,11.3341989 5.86875,11.6031989 C5.94775,12.5581989 6.42175,13.5221989 7.13675,14.1801989 C7.27875,14.3101989 7.33675,14.5061989 7.28875,14.6921989 L6.92775,16.1101989 Z M14.75375,16.2201989 C16.67075,16.6911989 18.01075,18.3761989 18.01075,20.3171989 C18.01075,20.6061989 17.77775,20.8401989 17.49075,20.8401989 L0.52075,20.8401989 C0.23375,20.8401989 -0.000249999999,20.6061989 -0.000249999999,20.3191989 C-0.000249999999,18.3761989 1.33975,16.6911989 3.25775,16.2211989 L5.99675,15.5511989 L6.20675,14.7271989 C5.53375,14.0191989 5.05675,13.0771989 4.88675,12.1201989 C4.40575,11.9851989 4.04575,11.5761989 3.98175,11.0791989 L3.79775,9.63219888 C3.75275,9.28219888 3.86175,8.92819888 4.09675,8.66219888 C4.21975,8.52119888 4.37375,8.40919888 4.54775,8.33519888 C4.46775,7.65119888 4.42775,7.18419888 4.42775,6.94719888 C4.42775,5.56919888 4.84675,3.97919888 8.10475,3.90019888 C9.23275,3.17319888 10.43175,3.17319888 10.94675,3.17319888 C12.29975,3.17319888 13.28175,3.61619888 13.86475,4.48919888 C14.64675,5.65719888 14.26475,6.47019888 13.80675,6.94619888 L13.57275,7.17619888 L13.51475,8.36019888 C13.66675,8.43219888 13.80575,8.53819888 13.91875,8.66719888 C14.15175,8.93219888 14.25975,9.28419888 14.21475,9.63219888 L14.03075,11.0781989 C13.97075,11.5411989 13.65375,11.9301989 13.21275,12.0901989 C13.04275,13.0901989 12.53975,14.0681989 11.82175,14.7921989 L12.01575,15.5501989 L14.75375,16.2201989 Z"
})));
HeadBoth.displayName = "DecorativeIcon";

const HeadFemale = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M19.7817727,19.7818978 C19.4796311,20.0840394 19.1614819,20.3591684 18.8343286,20.6192903 L15.8929498,19.33869 C15.7518837,19.2606534 15.6648429,19.1646084 15.596811,19.0695639 C16.8914179,18.8674691 18.1550102,18.4922933 19.353572,17.9270283 C19.5106456,17.8539941 19.6146944,17.7029232 19.6357042,17.5308426 C19.6547131,17.3587619 19.5816789,17.1866813 19.4466156,17.0796311 C19.4286072,17.0656245 17.7368141,15.6699703 17.7368141,10.9677661 C17.7368141,5.96442082 16.1710802,4.9139284 14.856464,4.9139284 L14.6093481,4.9139284 C13.9680475,4.23160857 12.9735814,3.87043927 12.0001251,3.96148194 C10.4674066,3.96148194 6.26243552,5.62226043 6.26243552,10.9677661 C6.26243552,15.6699703 4.56964202,17.0656245 4.55863686,17.0746287 C4.41757074,17.179678 4.34253556,17.3507582 4.36054401,17.5258402 C4.37855245,17.7009223 4.4866031,17.8529936 4.64567766,17.9270283 C5.84924183,18.4932937 7.11483508,18.8694701 8.41244333,19.0715648 C8.35241519,19.1606065 8.27437861,19.2486478 8.15032046,19.3176802 L5.16592153,20.6192903 C4.83876817,20.3591684 4.52061904,20.0840394 4.21747694,19.7818978 C-0.0735344693,15.4908864 -0.0735344693,8.50861341 4.21747694,4.217602 C6.36348288,2.07259653 9.18180397,1.00009379 12.0001251,1.00009379 C14.8184461,1.00009379 17.6357668,2.07259653 19.7817727,4.217602 C24.0727841,8.50861341 24.0727841,15.4908864 19.7817727,19.7818978 M6.11836798,21.2936064 L8.59252775,20.2141004 C9.31586681,19.8119118 9.53096764,19.1345943 9.55397843,18.743411 C9.5549789,18.7344068 9.55998124,18.7274035 9.56098171,18.7193997 C9.56198218,18.7133969 9.55898077,18.7073941 9.55898077,18.7013913 C9.55998124,18.6903861 9.56398312,18.6753791 9.56398312,18.6653744 C9.56398312,18.6403627 9.55297796,18.6193528 9.54997655,18.5943411 C9.54497421,18.5613256 9.5419728,18.5283101 9.52996717,18.4972956 C9.51896201,18.4672815 9.50295451,18.4402689 9.48694701,18.4142567 C9.46993903,18.3852431 9.454932,18.3582304 9.43292168,18.3342192 C9.41191183,18.3102079 9.38690011,18.2931999 9.36188839,18.2731906 C9.33587619,18.2541816 9.31186494,18.2341723 9.28185087,18.2191652 C9.25283727,18.2051587 9.22082226,18.1981554 9.18880725,18.1901516 C9.164796,18.1831484 9.14478662,18.1711427 9.11877443,18.1681413 C7.94322339,18.0380804 6.79468501,17.7449429 5.6921682,17.2957324 C6.31746131,16.4503361 7.26290449,14.5744568 7.26290449,10.9677661 C7.26290449,6.00544005 11.2207597,4.96195091 12.0451462,4.95994998 C12.8145068,4.88691574 13.5708613,5.19005784 13.9850555,5.72130686 C14.0801,5.84336408 14.225168,5.91439737 14.3802407,5.91439737 L14.856464,5.91439737 C16.4922307,5.91439737 16.7363452,9.08088166 16.7363452,10.9677661 C16.7363452,14.5754572 17.6817883,16.4503361 18.306081,17.2957324 C17.2065656,17.7449429 16.0560263,18.0380804 14.8814757,18.1681413 C14.8554635,18.1711427 14.8364546,18.1831484 14.8114429,18.1901516 C14.7794279,18.1981554 14.7474128,18.2051587 14.7173988,18.2191652 C14.6883852,18.2341723 14.6653744,18.2541816 14.6393622,18.2721901 C14.61335,18.2921995 14.5883383,18.3102079 14.566328,18.3352196 C14.5453181,18.3582304 14.5303111,18.3852431 14.5133031,18.4122557 C14.4972956,18.4402689 14.4802876,18.4662811 14.4692825,18.4972956 C14.4582773,18.5283101 14.4552759,18.5613256 14.4502736,18.5943411 C14.4462717,18.6193528 14.4352665,18.6393622 14.4352665,18.6653744 C14.4352665,18.6753791 14.4392684,18.6903861 14.4402689,18.7003908 C14.4402689,18.7073941 14.4372675,18.7133969 14.4382679,18.7193997 C14.4392684,18.7284039 14.4442708,18.7354072 14.4462717,18.7444114 C14.4692825,19.1355948 14.6863842,19.8139128 15.4497421,20.2341097 L17.8808817,21.2946068 C14.3012037,23.5586681 9.69804596,23.5576677 6.11836798,21.2936064 M20.4891043,3.51027044 C15.80791,-1.1699234 8.19234016,-1.1699234 3.51014538,3.51027044 C-1.17004846,8.19146475 -1.17004846,15.808035 3.51014538,20.4892293 C5.85124277,22.8303267 8.92568391,23.9998749 12.0001251,23.9998749 C15.0745662,23.9998749 18.1480069,22.8303267 20.4891043,20.4892293 C25.1702986,15.808035 25.1702986,8.19146475 20.4891043,3.51027044"
})));
HeadFemale.displayName = "DecorativeIcon";

const HeadMale = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M19.25,20.195 L16.382,18.95 C15.465,18.576 15.035,17.136 14.937,16.571 C15.585,15.979 16.258,15.048 16.258,14.155 C16.258,13.903 16.319,13.803 16.345,13.772 C16.49,13.725 16.609,13.616 16.667,13.473 C16.687,13.425 17.155,12.287 17.155,11.516 C17.155,11.476 17.15,11.434 17.139,11.387 C17.086,11.176 16.945,10.899 16.706,10.724 L16.706,8.437 C16.706,6.953 16.229,6.378 15.795,6.054 C15.671,5.25 14.778,3.958 12.148,3.958 C9.324,3.958 7.59,6.567 7.59,8.437 L7.59,10.724 C7.352,10.898 7.211,11.175 7.157,11.387 C7.146,11.431 7.141,11.473 7.141,11.516 C7.141,12.263 7.579,13.351 7.628,13.472 C7.695,13.636 7.808,13.738 7.936,13.764 C7.937,13.765 8.039,13.833 8.039,14.155 C8.039,15.047 8.711,15.978 9.359,16.571 C9.261,17.136 8.831,18.576 7.92,18.948 L4.75,20.197 C2.392,18.11 1.042,15.127 1.042,12 C1.042,5.957 5.958,1.041 12,1.041 C18.042,1.041 22.958,5.957 22.958,12 C22.958,15.126 21.607,18.108 19.25,20.195 L19.25,20.195 Z M8.308,19.915 C9.897,19.265 10.427,16.924 10.427,16.354 C10.427,16.195 10.356,16.048 10.233,15.948 C9.675,15.497 9.081,14.715 9.081,14.155 C9.081,13.413 8.749,13.058 8.526,12.904 C8.374,12.491 8.21,11.947 8.187,11.596 C8.187,11.594 8.188,11.593 8.189,11.591 C8.44,11.553 8.632,11.337 8.632,11.076 L8.632,8.437 C8.632,7.036 10.002,5 12.149,5 C14.016,5 14.666,5.749 14.76,6.169 C14.742,6.235 14.736,6.296 14.742,6.351 C14.772,6.633 14.982,6.765 15.098,6.838 C15.281,6.951 15.665,7.189 15.665,8.438 L15.665,11.077 C15.665,11.349 15.851,11.559 16.105,11.589 C16.106,11.592 16.108,11.596 16.11,11.599 C16.087,11.948 15.924,12.492 15.771,12.905 C15.579,13.039 15.217,13.392 15.217,14.155 C15.217,14.715 14.623,15.497 14.063,15.95 C13.941,16.05 13.871,16.198 13.871,16.354 C13.871,16.925 14.398,19.265 15.979,19.91 L18.324,20.928 C16.458,22.257 14.275,22.958 12,22.958 C9.733,22.958 7.559,22.262 5.697,20.944 L8.308,19.915 Z M12,0 C5.383,0 0,5.383 0,12 C0,18.617 5.383,24 12,24 C18.617,24 24,18.617 24,12 C24,5.383 18.617,0 12,0 L12,0 Z"
})));
HeadMale.displayName = "DecorativeIcon";

const Headset = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M21.908,16.2455 C21.019,19.0825 19.81,21.9485 19.8,21.9745 C19.775,22.0285 19.749,22.0845 19.717,22.1355 C19.323,22.7925 18.467,23.0075 17.81,22.6125 L16.242,21.6715 C15.649,21.3165 15.405,20.6025 15.659,19.9785 L17.523,15.8875 C17.74,15.3565 18.243,15.0145 18.805,15.0145 C18.969,15.0145 19.13,15.0445 19.278,15.0995 L21.908,16.2455 Z M6.485,15.9095 L8.33,19.9565 C8.589,20.5965 8.348,21.3165 7.758,21.6715 L6.19,22.6125 C6.138,22.6425 6.084,22.6715 6.03,22.6955 C5.692,22.8455 5.314,22.8505 4.967,22.7155 C4.622,22.5805 4.351,22.3205 4.204,21.9835 C4.153,21.8625 2.959,19.0165 2.093,16.2455 L4.697,15.1095 C5.395,14.8445 6.197,15.1975 6.485,15.9095 L6.485,15.9095 Z M12,-0.0005 C5.383,-0.0005 4.54747351e-13,5.3825 4.54747351e-13,11.9995 C4.54747351e-13,15.0725 2.985,22.1525 3.113,22.4535 C3.388,23.0845 3.893,23.5705 4.533,23.8215 C4.836,23.9395 5.153,24.0005 5.474,24.0005 C5.83,24.0005 6.178,23.9275 6.508,23.7835 C6.61,23.7375 6.708,23.6865 6.801,23.6325 L8.37,22.6905 C9.465,22.0315 9.908,20.6865 9.422,19.4875 L7.576,15.4405 C7.054,14.1505 5.565,13.5095 4.248,14.0115 L1.753,15.0975 C1.378,13.7475 1.188,12.7065 1.188,11.9995 C1.188,6.0375 6.038,1.1875 12,1.1875 C17.962,1.1875 22.811,6.0375 22.811,11.9995 C22.811,12.7065 22.622,13.7475 22.247,15.0975 L19.724,13.9985 C18.406,13.4965 16.959,14.1245 16.433,15.4175 L14.568,19.5095 C14.087,20.6935 14.533,22.0315 15.63,22.6905 L17.199,23.6325 C18.419,24.3625 20.007,23.9665 20.737,22.7455 C20.793,22.6515 20.842,22.5565 20.89,22.4475 C20.947,22.3115 22.299,19.1035 23.191,16.1055 C23.197,16.0925 23.201,16.0775 23.204,16.0645 C23.732,14.2865 24,12.9185 24,11.9995 C24,5.3825 18.617,-0.0005 12,-0.0005 L12,-0.0005 Z"
})));
Headset.displayName = "DecorativeIcon";

const Heart = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M17,1 C15.106,1 13.314,1.76 12,3.103 C10.686,1.76 8.894,1 7,1 C3.14,1 0,4.14 0,8 C0,9.742 0.703,11.447 2.032,12.93 C4.319,15.48 11.573,22.779 11.646,22.852 C11.739,22.947 11.867,23 12,23 C12.133,23 12.261,22.947 12.355,22.854 C12.428,22.781 19.682,15.482 21.969,12.931 C23.297,11.448 24,9.744 24,8 C24,4.141 20.86,1 17,1 Z M21.224,12.262 C19.245,14.47 13.489,20.289 12,21.79 C10.51,20.289 4.755,14.47 2.776,12.263 C1.966,11.357 1,9.885 1,8 C1,4.69 3.691,2 7,2 C8.788,2 10.47,2.79 11.615,4.168 C11.805,4.397 12.195,4.397 12.384,4.168 C13.53,2.789 15.212,2 17,2 C20.309,2 23,4.691 23,8 C23,9.885 22.034,11.357 21.224,12.262 Z"
})));
Heart.displayName = "DecorativeIcon";

const Heartbeat = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M23.48,10.7048 C23.766,10.7048 24,10.9378 24,11.2248 C24,11.5108 23.766,11.7438 23.48,11.7438 L14.993,11.7438 C14.823,11.7438 14.664,11.6608 14.567,11.5208 L12.979,9.2388 L10.914,16.1248 C10.855,16.3208 10.685,16.4648 10.482,16.4898 C10.464,16.4928 10.439,16.4948 10.416,16.4948 C10.237,16.4948 10.067,16.3998 9.973,16.2468 L7.219,11.7438 L0.519,11.7438 C0.232,11.7438 0,11.5108 0,11.2248 C0,10.9378 0.232,10.7048 0.519,10.7048 L7.51,10.7048 C7.692,10.7048 7.857,10.7978 7.954,10.9528 L10.252,14.7118 L12.294,7.9078 C12.351,7.7188 12.514,7.5758 12.709,7.5438 C12.908,7.5148 13.103,7.5948 13.217,7.7618 L15.264,10.7048 L23.48,10.7048 Z M20.6343,12.072 L20.7133,11.981 L21.5173,12.641 L21.4333,12.737 C21.3133,12.877 21.2143,12.989 21.1013,13.103 L12.3673,21.852 C12.2693,21.951 12.1383,22.005 11.9993,22.005 C11.8603,22.005 11.7303,21.951 11.6323,21.853 L2.8993,13.103 C2.7873,12.992 2.6913,12.883 2.5893,12.764 C2.3873,12.531 2.4083,12.199 2.6243,12.011 C2.8423,11.822 3.1623,11.84 3.3503,12.055 C3.4533,12.175 3.5373,12.272 3.6343,12.37 L11.9993,20.751 L20.3643,12.369 C20.4613,12.273 20.5453,12.175 20.6343,12.072 Z M1.4536,10.47 C1.3326,10.399 1.2456,10.286 1.2106,10.15 C1.0686,9.598 0.9966,9.046 0.9966,8.508 C1.0056,4.917 3.9276,1.995 7.5106,1.995 C9.1866,1.995 10.7756,2.636 11.9976,3.801 C13.2126,2.636 14.8026,1.995 16.4886,1.995 C20.0806,2.004 23.0026,4.926 23.0026,8.508 C23.0026,9.045 22.9296,9.597 22.7876,10.151 C22.7166,10.424 22.4286,10.594 22.1546,10.524 C21.8786,10.452 21.7106,10.169 21.7816,9.891 C21.9016,9.424 21.9636,8.958 21.9636,8.508 C21.9636,5.497 19.5076,3.042 16.4876,3.034 C14.9196,3.034 13.4266,3.712 12.3906,4.892 C12.1936,5.117 11.8076,5.117 11.6106,4.895 C10.5636,3.713 9.0696,3.034 7.5106,3.034 C4.4986,3.034 2.0436,5.491 2.0366,8.51 C2.0366,8.959 2.0966,9.424 2.2176,9.891 C2.2526,10.026 2.2326,10.166 2.1616,10.285 C2.0916,10.405 1.9786,10.49 1.8446,10.524 C1.8016,10.535 1.7576,10.541 1.7136,10.541 C1.6236,10.541 1.5346,10.517 1.4536,10.47 Z"
})));
Heartbeat.displayName = "DecorativeIcon";

const Helpdesk = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20px",
  height: "20px",
  viewBox: "0 0 20 20"
}, /*#__PURE__*/React.createElement("path", {
  d: "M15.4166667,0 C17.4841667,0 19.1666667,1.6825 19.1666667,3.75 L19.1666667,3.75 L19.1666667,10.4166667 C19.1666667,10.6466667 18.98,10.8333333 18.75,10.8333333 C18.52,10.8333333 18.3333333,10.6466667 18.3333333,10.4166667 L18.3333333,10.4166667 L18.3333333,3.75 C18.3333333,2.14166667 17.025,0.833333333 15.4166667,0.833333333 L15.4166667,0.833333333 L3.75,0.833333333 C2.14166667,0.833333333 0.833333333,2.14166667 0.833333333,3.75 L0.833333333,3.75 L0.833333333,18.4325 L4.26333333,14.3166667 C4.3425,14.2216667 4.46,14.1666667 4.58333333,14.1666667 L4.58333333,14.1666667 L9.58333333,14.1666667 C9.81333333,14.1666667 10,14.3533333 10,14.5833333 C10,14.8133333 9.81333333,15 9.58333333,15 L9.58333333,15 L4.77833333,15 L0.736666667,19.85 C0.655833333,19.9475 0.538333333,20 0.416666667,20 C0.369166667,20 0.320833333,19.9916667 0.275,19.975 C0.11,19.915 0,19.7583333 0,19.5833333 L0,19.5833333 L0,3.75 C0,1.6825 1.6825,0 3.75,0 L3.75,0 Z M15.4166667,10.8333333 C17.9441667,10.8333333 20,12.8891667 20,15.4166667 C20,17.9441667 17.9441667,20 15.4166667,20 C12.8891667,20 10.8333333,17.9441667 10.8333333,15.4166667 C10.8333333,12.8891667 12.8891667,10.8333333 15.4166667,10.8333333 Z M15.4166667,11.6666667 C13.3491667,11.6666667 11.6666667,13.3491667 11.6666667,15.4166667 C11.6666667,17.4841667 13.3491667,19.1666667 15.4166667,19.1666667 C17.4841667,19.1666667 19.1666667,17.4841667 19.1666667,15.4166667 C19.1666667,13.3491667 17.4841667,11.6666667 15.4166667,11.6666667 Z M15.125,17.625 C15.275,17.4666667 15.5583333,17.4666667 15.7083333,17.625 C15.7916667,17.7 15.8333333,17.8083333 15.8333333,17.9166667 C15.8333333,18.025 15.7916667,18.1333333 15.7083333,18.2083333 C15.6333333,18.2916667 15.525,18.3333333 15.4166667,18.3333333 C15.3083333,18.3333333 15.2,18.2916667 15.125,18.2083333 C15.05,18.1416667 15,18.0333333 15,17.9166667 C15,17.8 15.0416667,17.7 15.125,17.625 Z M15.4158333,12.5 C16.565,12.5 17.5,13.2475 17.5,14.1666667 C17.5,14.9625 16.94,15.4966667 15.8341667,15.7566667 L15.8341667,15.7566667 L15.8333333,16.25 C15.8333333,16.4808333 15.6466667,16.6666667 15.4166667,16.6666667 C15.1858333,16.6666667 15,16.4791667 15,16.25 L15,16.25 L15.0008333,15.4166667 C15.0008333,15.2191667 15.14,15.0491667 15.3333333,15.0091667 L15.3333333,15.0091667 L15.4241667,14.9916667 C16.2716667,14.835 16.6666667,14.5725 16.6666667,14.1666667 C16.6666667,13.715 16.0933333,13.3333333 15.4158333,13.3333333 C14.7633333,13.3333333 14.2016667,13.6866667 14.1658333,14.1216667 C14.1466667,14.3508333 13.9475,14.53 13.7158333,14.5016667 C13.4866667,14.4825 13.3166667,14.2808333 13.3358333,14.0516667 C13.4091667,13.1675 14.3041667,12.5 15.4158333,12.5 Z M5.41666667,6.66666667 C6.10583333,6.66666667 6.66666667,7.2275 6.66666667,7.91666667 C6.66666667,8.60583333 6.10583333,9.16666667 5.41666667,9.16666667 C4.7275,9.16666667 4.16666667,8.60583333 4.16666667,7.91666667 C4.16666667,7.2275 4.7275,6.66666667 5.41666667,6.66666667 Z M9.58333333,6.66666667 C10.2725,6.66666667 10.8333333,7.2275 10.8333333,7.91666667 C10.8333333,8.60583333 10.2725,9.16666667 9.58333333,9.16666667 C8.89416667,9.16666667 8.33333333,8.60583333 8.33333333,7.91666667 C8.33333333,7.2275 8.89416667,6.66666667 9.58333333,6.66666667 Z M13.75,6.66666667 C14.4391667,6.66666667 15,7.2275 15,7.91666667 C15,8.60583333 14.4391667,9.16666667 13.75,9.16666667 C13.0608333,9.16666667 12.5,8.60583333 12.5,7.91666667 C12.5,7.2275 13.0608333,6.66666667 13.75,6.66666667 Z M5.41666667,7.5 C5.18666667,7.5 5,7.68666667 5,7.91666667 C5,8.14666667 5.18666667,8.33333333 5.41666667,8.33333333 C5.64666667,8.33333333 5.83333333,8.14666667 5.83333333,7.91666667 C5.83333333,7.68666667 5.64666667,7.5 5.41666667,7.5 Z M9.58333333,7.5 C9.35333333,7.5 9.16666667,7.68666667 9.16666667,7.91666667 C9.16666667,8.14666667 9.35333333,8.33333333 9.58333333,8.33333333 C9.81333333,8.33333333 10,8.14666667 10,7.91666667 C10,7.68666667 9.81333333,7.5 9.58333333,7.5 Z M13.75,7.5 C13.52,7.5 13.3333333,7.68666667 13.3333333,7.91666667 C13.3333333,8.14666667 13.52,8.33333333 13.75,8.33333333 C13.98,8.33333333 14.1666667,8.14666667 14.1666667,7.91666667 C14.1666667,7.68666667 13.98,7.5 13.75,7.5 Z"
})));
Helpdesk.displayName = "DecorativeIcon";

const Home = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M8.9565,19.002 L15.0435,19.002 L15.0435,12.915 L8.9565,12.915 L8.9565,19.002 Z M15.5625,11.876 C15.8685,11.876 16.0815,12.09 16.0815,12.396 L16.0815,19.521 C16.0815,19.828 15.8685,20.041 15.5625,20.041 L8.4365,20.041 C8.1305,20.041 7.9165,19.828 7.9165,19.521 L7.9165,12.396 C7.9165,12.09 8.1305,11.876 8.4365,11.876 L15.5625,11.876 Z M20.313,11.085 L20.437,11.085 L20.437,11.164 L22.231,11.164 L19.873,8.805 L19.873,8.754 C19.873,8.734 19.851,8.672 19.839,8.635 C19.816,8.564 19.793,8.497 19.793,8.437 L19.793,1.039 L16.874,1.039 L16.874,4.399 C16.874,4.633 16.736,4.816 16.496,4.905 C16.343,5.013 16.058,4.911 15.95,4.804 L12.465,1.24 C12.373,1.119 12.239,1.053 12.077,1.041 C11.878,1.032 11.672,1.102 11.533,1.241 L1.766,11.085 L3.686,11.085 C3.992,11.085 4.206,11.298 4.206,11.604 L4.206,22.961 L19.793,22.961 L19.793,11.604 C19.793,11.298 20.007,11.085 20.313,11.085 Z M23.907,11.232 C24,11.417 24,11.601 24,11.762 L23.986,11.817 C23.892,12.006 23.698,12.124 23.48,12.124 L20.833,12.124 L20.833,23.481 C20.833,23.786 20.619,24 20.313,24 L3.686,24 C3.38,24 3.167,23.786 3.167,23.481 L3.167,12.124 L0.519,12.124 C0.301,12.124 0.107,12.006 0.013,11.817 L0,11.762 C0,11.601 0,11.417 0.092,11.232 L0.115,11.2 L10.724,0.512 C11.406,-0.17 12.514,-0.17 13.196,0.511 L15.834,3.15 L15.834,0.52 C15.834,0.213 16.048,0 16.355,0 L20.313,0 C20.619,0 20.833,0.213 20.833,0.52 L20.833,8.227 L23.907,11.232 Z"
})));
Home.displayName = "DecorativeIcon";

const Warranty$1 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M12.4815,12.4674499 L11.1965,12.4674499 C10.7445,12.4674499 10.3485,12.8634499 10.3485,13.3144499 L10.3485,15.3594499 L9.1895,15.3594499 C9.1525,15.3544499 9.0765,15.2774499 9.0715,15.2434499 L9.0715,11.0664499 C9.0715,10.7814499 8.8455,10.5494499 8.5635,10.5394499 L11.9965,7.22244992 L15.3715,10.5394499 C15.0825,10.5404499 14.8475,10.7764499 14.8475,11.0664499 L14.8475,15.2424499 C14.8425,15.2784499 14.7665,15.3554499 14.7315,15.3594499 L13.3295,15.3594499 L13.3295,13.3144499 C13.3295,12.8634499 12.9335,12.4674499 12.4815,12.4674499 L12.4815,12.4674499 Z M12.3695,6.11144992 L17.0285,10.6904499 C17.1815,10.8414499 17.2275,11.0674499 17.1475,11.2654499 C17.0645,11.4644499 16.8725,11.5924499 16.6585,11.5924499 L15.9005,11.5924499 L15.9005,15.2434499 C15.9005,15.8544499 15.3435,16.4124499 14.7315,16.4124499 L12.8025,16.4124499 C12.5125,16.4124499 12.2765,16.1754499 12.2765,15.8854499 L12.2765,13.5204499 L11.4015,13.5204499 L11.4015,15.8854499 C11.4015,16.1754499 11.1655,16.4124499 10.8755,16.4124499 L9.1875,16.4124499 C8.5755,16.4124499 8.0185,15.8544499 8.0185,15.2434499 L8.0185,11.5924499 L7.2595,11.5924499 C7.0445,11.5924499 6.8525,11.4634499 6.7715,11.2624499 C6.6905,11.0634499 6.7385,10.8374499 6.8945,10.6874499 L11.6335,6.10844992 C11.8365,5.91144992 12.1665,5.91044992 12.3695,6.11144992 Z M20.7115,4.55874992 C20.7115,4.01374992 20.3075,3.66674992 19.9285,3.52574992 L12.3295,0.966749917 C12.2255,0.941749917 12.1105,0.927749917 11.9995,0.927749917 C11.8825,0.927749917 11.7645,0.942749917 11.6455,0.972749917 L4.0535,3.53174992 C3.5525,3.69874992 3.2875,4.05374992 3.2875,4.55874992 L3.2875,14.5197499 C3.2875,20.1357499 10.9465,22.7207499 11.9995,23.0487499 C13.0525,22.7207499 20.7115,20.1357499 20.7115,14.5197499 L20.7115,4.55874992 Z M20.2805,2.53274992 C21.1845,2.87174992 21.7655,3.66574992 21.7655,4.55874992 L21.7655,14.5197499 C21.7655,21.3467499 12.5335,23.9957499 12.1415,24.1057499 C12.0955,24.1187499 12.0475,24.1247499 11.9995,24.1247499 C11.9515,24.1247499 11.9035,24.1187499 11.8575,24.1057499 C11.4655,23.9957499 2.2345,21.3467499 2.2345,14.5197499 L2.2345,4.55874992 C2.2345,3.59974992 2.7895,2.84274992 3.7185,2.53274992 L11.3495,-0.0372500833 C11.7845,-0.149250083 12.1945,-0.154250083 12.6095,-0.0492500833 C12.6215,-0.0462500833 12.6355,-0.0422500833 12.6495,-0.0372500833 L20.2805,2.53274992 Z"
})));
Warranty$1.displayName = "DecorativeIcon";

const IdTag = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -3)",
  d: "M6.9858,8.5725 C6.4078,9.1505 6.4078,10.0915 6.9858,10.6695 C7.5648,11.2485 8.5058,11.2475 9.0828,10.6695 C9.3628,10.3895 9.5178,10.0165 9.5178,9.6205 C9.5178,9.2245 9.3628,8.8525 9.0828,8.5725 C8.7938,8.2835 8.4138,8.1385 8.0338,8.1385 C7.6548,8.1385 7.2748,8.2835 6.9858,8.5725 Z M8.0348,12.1025 C7.3988,12.1025 6.7628,11.8605 6.2788,11.3765 C5.3108,10.4085 5.3108,8.8335 6.2788,7.8655 C7.2468,6.8985 8.8228,6.8975 9.7898,7.8655 C10.2588,8.3345 10.5178,8.9575 10.5178,9.6205 C10.5178,10.2845 10.2588,10.9075 9.7898,11.3765 C9.3058,11.8605 8.6708,12.1025 8.0348,12.1025 Z M10.0171,12.6897 C11.1671,12.6897 12.1031,13.6257 12.1031,14.7757 L12.1031,16.3627 C12.1031,16.6387 11.8801,16.8627 11.6031,16.8627 C11.3271,16.8627 11.1031,16.6387 11.1031,16.3627 L11.1031,14.7757 C11.1031,14.1767 10.6161,13.6897 10.0171,13.6897 L6.0521,13.6897 C5.4531,13.6897 4.9651,14.1767 4.9651,14.7757 L4.9651,16.3627 C4.9651,16.6387 4.7421,16.8627 4.4651,16.8627 C4.1891,16.8627 3.9651,16.6387 3.9651,16.3627 L3.9651,14.7757 C3.9651,13.6257 4.9011,12.6897 6.0521,12.6897 L10.0171,12.6897 Z M19.5342,7.1379 C19.8102,7.1379 20.0342,7.3619 20.0342,7.6379 C20.0342,7.9139 19.8102,8.1379 19.5342,8.1379 L14.7752,8.1379 C14.4992,8.1379 14.2752,7.9139 14.2752,7.6379 C14.2752,7.3619 14.4992,7.1379 14.7752,7.1379 L19.5342,7.1379 Z M19.5342,11.1038 C19.8102,11.1038 20.0342,11.3278 20.0342,11.6038 C20.0342,11.8798 19.8102,12.1038 19.5342,12.1038 L14.7752,12.1038 C14.4992,12.1038 14.2752,11.8798 14.2752,11.6038 C14.2752,11.3278 14.4992,11.1038 14.7752,11.1038 L19.5342,11.1038 Z M19.5342,15.0696 C19.8102,15.0696 20.0342,15.2936 20.0342,15.5696 C20.0342,15.8456 19.8102,16.0696 19.5342,16.0696 L14.7752,16.0696 C14.4992,16.0696 14.2752,15.8456 14.2752,15.5696 C14.2752,15.2936 14.4992,15.0696 14.7752,15.0696 L19.5342,15.0696 Z M23,18.7415 L23,5.2595 C23,4.6595 22.513,4.1725 21.914,4.1725 L2.086,4.1725 C1.487,4.1725 1,4.6595 1,5.2595 L1,18.7415 C1,19.3405 1.487,19.8275 2.086,19.8275 L21.914,19.8275 C22.513,19.8275 23,19.3405 23,18.7415 Z M21.914,3.1725 C23.064,3.1725 24,4.1085 24,5.2595 L24,18.7415 C24,19.8915 23.064,20.8275 21.914,20.8275 L2.086,20.8275 C0.936,20.8275 0,19.8915 0,18.7415 L0,5.2595 C0,4.1085 0.936,3.1725 2.086,3.1725 L21.914,3.1725 Z"
})));
IdTag.displayName = "DecorativeIcon";

const Infinite = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "12",
  viewBox: "0 0 24 12"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -6)",
  d: "M18.5,16.6555 C15.631,16.6555 14.127,14.4295 12.591,12.0005 C14.127,9.5705 15.631,7.3445 18.5,7.3445 C20.981,7.3445 23,9.4335 23,12.0005 C23,14.5675 20.981,16.6555 18.5,16.6555 M5.5,16.6555 C3.019,16.6555 1,14.5675 1,12.0005 C1,9.4335 3.019,7.3445 5.5,7.3445 C8.369,7.3445 9.873,9.5705 11.409,12.0005 C9.873,14.4295 8.369,16.6555 5.5,16.6555 M18.5,6.3445 C15.271,6.3445 13.55,8.6435 12,11.0665 C10.45,8.6435 8.729,6.3445 5.5,6.3445 C2.467,6.3445 0,8.8825 0,12.0005 C0,15.1185 2.467,17.6555 5.5,17.6555 C8.729,17.6555 10.45,15.3565 12,12.9345 C13.55,15.3565 15.271,17.6555 18.5,17.6555 C21.532,17.6555 24,15.1185 24,12.0005 C24,8.8825 21.532,6.3445 18.5,6.3445"
})));
Infinite.displayName = "DecorativeIcon";

const Information = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M13.5049,17.418 C13.7909,17.418 14.0239,17.651 14.0239,17.939 C14.0239,18.226 13.7909,18.458 13.5049,18.458 L10.4959,18.458 C10.2089,18.458 9.9759,18.226 9.9759,17.939 C9.9759,17.651 10.2089,17.418 10.4959,17.418 L11.4809,17.418 L11.4809,10.246 L10.8629,10.863 C10.6599,11.066 10.3319,11.066 10.1289,10.863 C10.0299,10.765 9.9759,10.634 9.9759,10.496 C9.9759,10.357 10.0299,10.227 10.1289,10.128 L11.6329,8.624 C11.7829,8.475 12.0049,8.43 12.1999,8.512 C12.3939,8.592 12.5199,8.78 12.5199,8.991 L12.5199,17.418 L13.5049,17.418 Z M12,6.8184 C11.786,6.8184 11.571,6.7364 11.409,6.5744 C11.083,6.2484 11.083,5.7174 11.409,5.3914 C11.734,5.0654 12.265,5.0654 12.591,5.3914 C12.917,5.7174 12.917,6.2484 12.591,6.5744 C12.429,6.7364 12.214,6.8184 12,6.8184 Z M12,22.9609 C14.928,22.9609 17.68,21.8199 19.751,19.7499 C21.82,17.6799 22.961,14.9279 22.961,11.9999 C22.961,9.0729 21.82,6.3199 19.75,4.2499 C17.679,2.1799 14.927,1.0389 12,1.0389 C9.072,1.0389 6.32,2.1799 4.25,4.2499 C2.18,6.3199 1.039,9.0719 1.039,11.9999 C1.039,14.9269 2.18,17.6789 4.25,19.7509 C6.32,21.8199 9.073,22.9609 12,22.9609 Z M20.484,3.5149 C22.752,5.7809 24,8.7939 24,11.9999 C24,15.2059 22.752,18.2189 20.486,20.4859 C18.219,22.7519 15.206,23.9999 12,23.9999 C8.794,23.9999 5.781,22.7519 3.515,20.4859 C1.248,18.2189 0,15.2049 0,11.9999 C0,8.7949 1.248,5.7819 3.515,3.5149 C5.782,1.2479 8.795,-0.0001 12,-0.0001 C15.205,-0.0001 18.219,1.2479 20.484,3.5149 Z"
})));
Information.displayName = "DecorativeIcon";

const Internet = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "17",
  viewBox: "0 0 24 17"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -4)",
  d: "M15.809,16.364 C15.697,16.364 15.584,16.327 15.492,16.25 C13.531,14.639 10.471,14.639 8.51,16.25 C8.297,16.427 7.982,16.395 7.807,16.182 C7.631,15.969 7.661,15.654 7.875,15.479 C9.032,14.525 10.498,14 12,14 C13.502,14 14.968,14.525 16.126,15.479 C16.34,15.654 16.37,15.969 16.194,16.182 C16.096,16.302 15.952,16.364 15.809,16.364 Z M19.432,12.906 C19.311,12.906 19.19,12.862 19.094,12.774 C17.145,10.985 14.626,10 12,10 C9.374,10 6.855,10.985 4.906,12.774 C4.705,12.96 4.387,12.948 4.2,12.744 C4.013,12.541 4.026,12.224 4.23,12.038 C6.363,10.079 9.123,9 12,9 C14.877,9 17.637,10.079 19.77,12.038 C19.974,12.225 19.987,12.541 19.8,12.744 C19.701,12.852 19.566,12.906 19.432,12.906 Z M23,9.417 C22.876,9.417 22.752,9.371 22.655,9.279 C19.756,6.52 15.972,5 12,5 C8.026,5 4.242,6.515 1.344,9.264 C1.145,9.453 0.827,9.447 0.638,9.245 C0.448,9.045 0.455,8.728 0.657,8.539 C3.74,5.612 7.769,4 12,4 C16.229,4 20.258,5.617 23.345,8.555 C23.545,8.745 23.553,9.062 23.363,9.262 C23.264,9.365 23.132,9.417 23,9.417 Z M12,21 C11.173,21 10.5,20.327 10.5,19.5 C10.5,18.673 11.173,18 12,18 C12.827,18 13.5,18.673 13.5,19.5 C13.5,20.327 12.827,21 12,21 Z M12,19 C11.725,19 11.5,19.225 11.5,19.5 C11.5,19.775 11.725,20 12,20 C12.275,20 12.5,19.775 12.5,19.5 C12.5,19.225 12.275,19 12,19 Z"
})));
Internet.displayName = "DecorativeIcon";

const Invisible = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(0 -3)",
  d: "M3.5000431,20.999625 C3.3720431,20.999625 3.2440431,20.950625 3.1460431,20.853625 C2.9510431,20.658625 2.9510431,20.341625 3.1460431,20.146625 L20.1460431,3.146625 C20.3410431,2.951625 20.6580431,2.951625 20.8530431,3.146625 C21.0480431,3.341625 21.0480431,3.658625 20.8530431,3.853625 L3.8530431,20.853625 C3.7560431,20.950625 3.6280431,20.999625 3.5000431,20.999625 Z M4.9530431,16.718625 C4.8570431,16.718625 4.7620431,16.691625 4.6770431,16.634625 C1.8120431,14.731625 0.159043098,12.384625 0.0900430984,12.285625 C-0.0399569016,12.098625 -0.0279569016,11.848625 0.118043098,11.676625 C0.349043098,11.403625 5.8390431,4.999625 12.0000431,4.999625 C13.0390431,4.999625 14.1430431,5.192625 15.2810431,5.575625 C15.5430431,5.663625 15.6830431,5.946625 15.5950431,6.208625 C15.5080431,6.471625 15.2240431,6.616625 14.9620431,6.522625 C13.9280431,6.175625 12.9310431,5.999625 12.0000431,5.999625 C7.0190431,5.999625 2.2970431,10.776625 1.1460431,12.026625 C1.6850431,12.713625 3.1250431,14.402625 5.2290431,15.801625 C5.4590431,15.953625 5.5220431,16.264625 5.3690431,16.493625 C5.2730431,16.640625 5.1140431,16.718625 4.9530431,16.718625 Z M12.0000431,15.999625 C10.9310431,15.999625 9.9260431,15.583625 9.1720431,14.827625 C8.9770431,14.632625 8.9770431,14.314625 9.1720431,14.120625 C9.3670431,13.925625 9.6840431,13.925625 9.8790431,14.120625 C10.4450431,14.687625 11.1980431,14.999625 12.0000431,14.999625 C13.6540431,14.999625 15.0000431,13.653625 15.0000431,11.999625 C15.0000431,11.197625 14.6870431,10.444625 14.1210431,9.878625 C13.9260431,9.684625 13.9260431,9.366625 14.1210431,9.171625 C14.3160431,8.976625 14.6330431,8.976625 14.8280431,9.171625 C15.5840431,9.925625 16.0000431,10.930625 16.0000431,11.999625 C16.0000431,14.205625 14.2060431,15.999625 12.0000431,15.999625 Z M8.5610431,13.109625 C8.3240431,13.109625 8.1130431,12.938625 8.0700431,12.696625 C8.0290431,12.469625 8.0000431,12.237625 8.0000431,11.999625 C8.0000431,9.793625 9.7940431,7.999625 12.0000431,7.999625 C12.2380431,7.999625 12.4700431,8.028625 12.6970431,8.068625 C12.9680431,8.116625 13.1500431,8.376625 13.1020431,8.647625 C13.0540431,8.918625 12.7890431,9.106625 12.5230431,9.052625 C12.3530431,9.022625 12.1800431,8.999625 12.0000431,8.999625 C10.3460431,8.999625 9.0000431,10.345625 9.0000431,11.999625 C9.0000431,12.179625 9.0230431,12.352625 9.0540431,12.522625 C9.1020431,12.793625 8.9200431,13.053625 8.6490431,13.101625 C8.6190431,13.107625 8.5900431,13.109625 8.5610431,13.109625 Z M12.0000431,18.999625 C10.1710431,18.999625 8.3330431,18.561625 6.5380431,17.694625 C6.2890431,17.574625 6.1840431,17.275625 6.3050431,17.027625 C6.4250431,16.778625 6.7260431,16.673625 6.9720431,16.794625 C8.6310431,17.594625 10.3220431,17.999625 12.0000431,17.999625 C16.9450431,17.999625 21.6360431,13.290625 22.8280431,11.999625 C22.0430431,11.151625 19.7470431,8.829625 16.8730431,7.341625 C16.6270431,7.214625 16.5310431,6.912625 16.6580431,6.667625 C16.7850431,6.421625 17.0900431,6.325625 17.3320431,6.452625 C21.0630431,8.385625 23.7680431,11.542625 23.8810431,11.676625 C24.0390431,11.863625 24.0400431,12.136625 23.8820431,12.322625 C23.6510431,12.595625 18.1610431,18.999625 12.0000431,18.999625 Z"
})));
Invisible.displayName = "DecorativeIcon";

const Key = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "13",
  height: "24",
  viewBox: "0 0 13 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-6)",
  d: "M12.5,24 C12.372,24 12.244,23.951 12.146,23.854 L10.146,21.854 C10.053,21.76 10,21.633 10,21.5 L10,19.707 L9.146,18.853 C8.951,18.658 8.951,18.341 9.146,18.146 L10,17.293 L10,16.707 L9.146,15.853 C8.951,15.658 8.951,15.341 9.146,15.146 L10,14.293 L10,13 L9.5,13 C9.224,13 9,12.776 9,12.5 L9,11.972 C7.143,10.781 6,8.71 6,6.5 C6,2.916 8.916,0 12.5,0 C16.084,0 19,2.916 19,6.5 C19,8.71 17.857,10.781 16,11.972 L16,12.5 C16,12.776 15.776,13 15.5,13 L15,13 L15,21.5 C15,21.633 14.947,21.76 14.854,21.854 L12.854,23.854 C12.756,23.951 12.628,24 12.5,24 Z M11,21.293 L12.5,22.793 L14,21.293 L14,12.5 C14,12.224 14.224,12 14.5,12 L15,12 L15,11.691 C15,11.513 15.095,11.348 15.249,11.258 C16.946,10.275 18,8.452 18,6.5 C18,3.467 15.532,1 12.5,1 C9.468,1 7,3.467 7,6.5 C7,8.452 8.054,10.275 9.751,11.258 C9.905,11.348 10,11.513 10,11.691 L10,12 L10.5,12 C10.776,12 11,12.224 11,12.5 L11,14.5 C11,14.633 10.947,14.76 10.854,14.854 L10.207,15.5 L10.853,16.146 C10.947,16.24 11,16.367 11,16.5 L11,17.5 C11,17.633 10.947,17.76 10.854,17.854 L10.207,18.5 L10.853,19.146 C10.947,19.24 11,19.367 11,19.5 L11,21.293 Z M12.5,7 C11.121,7 10,5.878 10,4.5 C10,3.122 11.121,2 12.5,2 C13.879,2 15,3.122 15,4.5 C15,5.878 13.879,7 12.5,7 Z M12.5,3 C11.673,3 11,3.673 11,4.5 C11,5.327 11.673,6 12.5,6 C13.327,6 14,5.327 14,4.5 C14,3.673 13.327,3 12.5,3 Z M12.5,21 C12.224,21 12,20.776 12,20.5 L12,13.5 C12,13.224 12.224,13 12.5,13 C12.776,13 13,13.224 13,13.5 L13,20.5 C13,20.776 12.776,21 12.5,21 Z"
})));
Key.displayName = "DecorativeIcon";

const Laptop = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -3)",
  d: "M23.5,16.5 L22,16.5 L22,5 C22,4.173 21.327,3.5 20.5,3.5 L3.5,3.5 C2.673,3.5 2,4.173 2,5 L2,16.5 L0.5,16.5 C0.224,16.5 0,16.724 0,17 L0,18 C0,19.378 1.122,20.5 2.5,20.5 L21.5,20.5 C22.878,20.5 24,19.378 24,18 L24,17 C24,16.724 23.776,16.5 23.5,16.5 Z M3,5 C3,4.724 3.224,4.5 3.5,4.5 L20.5,4.5 C20.776,4.5 21,4.724 21,5 L21,16.5 L16,16.5 C15.867,16.5 15.74,16.553 15.648,16.646 L14.794,17.5 L9.208,17.5 L8.354,16.646 C8.26,16.553 8.133,16.5 8,16.5 L3,16.5 L3,5 Z M23,18 C23,18.827 22.327,19.5 21.5,19.5 L2.5,19.5 C1.673,19.5 1,18.827 1,18 L1,17.5 L7.793,17.5 L8.646,18.354 C8.74,18.447 8.867,18.5 9,18.5 L15,18.5 C15.133,18.5 15.26,18.447 15.353,18.354 L16.207,17.5 L23,17.5 L23,18 Z"
})));
Laptop.displayName = "DecorativeIcon";

const Layers = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M12,14.5 C11.921,14.5 11.841,14.481 11.769,14.443 L0.269,8.443 C0.104,8.357 0,8.187 0,8 C0,7.813 0.104,7.643 0.269,7.557 L11.769,1.557 C11.914,1.481 12.087,1.481 12.232,1.557 L23.732,7.557 C23.896,7.643 24,7.813 24,8 C24,8.187 23.896,8.357 23.731,8.443 L12.231,14.443 C12.159,14.481 12.079,14.5 12,14.5 Z M1.581,8 L12,13.437 L22.419,8 L12,2.563 L1.581,8 Z M12,18.5 C11.921,18.5 11.841,18.4806902 11.769,18.4420705 L0.269,12.34423 C0.104,12.2568277 0,12.0840555 0,11.8940062 C0,11.7039568 0.104,11.5311847 0.269,11.4437823 L1.941,10.5575628 C2.185,10.4305245 2.488,10.5230084 2.616,10.7730198 C2.744,11.022015 2.649,11.3289396 2.404,11.4590269 L1.581,11.8940062 L12,17.4196659 L22.419,11.8940062 L21.597,11.4580106 C21.352,11.3279233 21.257,11.0209987 21.385,10.7720035 C21.513,10.5230084 21.816,10.4295081 22.06,10.5565465 L23.732,11.442766 C23.896,11.5311847 24,11.7039568 24,11.8940062 C24,12.0840555 23.896,12.2568277 23.731,12.34423 L12.231,18.4420705 C12.159,18.4806902 12.079,18.5 12,18.5 Z M12,22.5 C11.921,22.5 11.841,22.4806902 11.769,22.4420705 L0.269,16.34423 C0.104,16.2568277 0,16.0840555 0,15.8940062 C0,15.7039568 0.104,15.5311847 0.269,15.4437823 L1.941,14.5575628 C2.185,14.4295081 2.488,14.5240247 2.616,14.7730198 C2.744,15.022015 2.649,15.3289396 2.404,15.4590269 L1.581,15.8940062 L12,21.4196659 L22.419,15.8940062 L21.597,15.4580106 C21.352,15.3279233 21.257,15.0209987 21.385,14.7720035 C21.513,14.5230084 21.816,14.4295081 22.06,14.5565465 L23.732,15.442766 C23.896,15.5311847 24,15.7039568 24,15.8940062 C24,16.0840555 23.896,16.2568277 23.731,16.34423 L12.231,22.4420705 C12.159,22.4806902 12.079,22.5 12,22.5 Z"
})));
Layers.displayName = "DecorativeIcon";

const Lifesaver = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12,24 C5.383,24 0,18.617 0,12 C0,5.383 5.383,0 12,0 C18.617,0 24,5.383 24,12 C24,18.617 18.617,24 12,24 Z M12,1 C5.935,1 1,5.935 1,12 C1,18.065 5.935,23 12,23 C18.065,23 23,18.065 23,12 C23,5.935 18.065,1 12,1 Z M12,7 C9.243,7 7,9.243 7,12 C7,14.757 9.243,17 12,17 C14.757,17 17,14.757 17,12 C17,9.243 14.757,7 12,7 Z M17.7960593,10.4459879 C17.9290623,10.9417858 18,11.4627473 18,12 C18,12.5375375 17.928987,13.0587665 17.7958477,13.5548006 L22.06,17.818 C22.255,18.013 22.255,18.33 22.06,18.525 C21.963,18.622 21.835,18.671 21.707,18.671 C21.579,18.671 21.451,18.622 21.353,18.525 L17.4136327,14.586513 C16.8215534,15.8210691 15.8193667,16.822918 14.584566,17.414566 L18.524,21.354 C18.719,21.549 18.719,21.866 18.524,22.061 C18.427,22.158 18.299,22.207 18.171,22.207 C18.043,22.207 17.915,22.158 17.817,22.061 L13.5524721,17.7964721 C13.0571355,17.9292091 12.5366965,18 12,18 C11.4627473,18 10.9417857,17.9290622 10.4459877,17.7960592 L6.182,22.061 C6.085,22.158 5.957,22.207 5.829,22.207 C5.701,22.207 5.573,22.158 5.475,22.061 C5.28,21.866 5.28,21.549 5.475,21.354 L9.41416282,17.4139567 C8.17972026,16.8221223 7.17787771,15.8202797 6.58604328,14.5858372 L2.646,18.525 C2.549,18.622 2.421,18.671 2.293,18.671 C2.165,18.671 2.037,18.622 1.939,18.525 C1.744,18.33 1.744,18.013 1.939,17.818 L6.20394079,13.5540123 C6.07093776,13.0582143 6,12.5372527 6,12 C6,11.4630321 6.07086256,10.9423381 6.20372931,10.4467763 L1.939,6.183 C1.744,5.988 1.744,5.671 1.939,5.476 C2.134,5.281 2.451,5.281 2.646,5.476 L6.58571922,9.41483884 C7.17742984,8.18025738 8.17921683,7.17826388 9.4136488,6.58628975 L5.476,2.646 C5.281,2.451 5.281,2.134 5.476,1.939 C5.671,1.744 5.988,1.744 6.183,1.939 L10.4467763,6.20372931 C10.9423381,6.07086256 11.4630321,6 12,6 C12.5372527,6 13.0582142,6.07093774 13.5540121,6.20394075 L17.817,1.94 C18.012,1.745 18.329,1.745 18.524,1.94 C18.719,2.135 18.719,2.452 18.524,2.647 L14.585837,6.58604321 C15.8202797,7.17787765 16.8221224,8.17972029 17.4139568,9.41416297 L21.353,5.476 C21.548,5.281 21.865,5.281 22.06,5.476 C22.255,5.671 22.255,5.988 22.06,6.183 L17.7960593,10.4459879 Z"
})));
Lifesaver.displayName = "DecorativeIcon";

const Lightbulb = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "24",
  viewBox: "0 0 16 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-4)",
  d: "M13.768,18 L10.232,18 C9.088,18 8.109,17.187 7.851,16.023 C7.706,15.367 7.458,14.8 7.093,14.291 C6.903,14.025 6.704,13.758 6.503,13.488 C5.33,11.91 4,10.123 4,8 C4,3.589 7.589,0 12,0 C16.411,0 20,3.589 20,8 C20,10.123 18.67,11.91 17.497,13.488 C17.296,13.758 17.097,14.025 16.907,14.291 C16.542,14.801 16.294,15.367 16.149,16.023 C15.891,17.188 14.912,18 13.768,18 Z M12,1 C8.14,1 5,4.141 5,8 C5,9.792 6.172,11.367 7.306,12.891 C7.511,13.166 7.713,13.439 7.907,13.709 C8.345,14.322 8.656,15.027 8.828,15.807 C8.983,16.51 9.561,17 10.232,17 L13.768,17 C14.439,17 15.017,16.51 15.172,15.807 C15.344,15.028 15.654,14.323 16.093,13.709 C16.287,13.438 16.489,13.166 16.694,12.891 C17.828,11.367 19,9.792 19,8 C19,4.141 15.86,1 12,1 Z M14.5,20 L9.5,20 C9.224,20 9,19.776 9,19.5 C9,19.224 9.224,19 9.5,19 L14.5,19 C14.776,19 15,19.224 15,19.5 C15,19.776 14.776,20 14.5,20 Z M14.5,22 L9.5,22 C9.224,22 9,21.776 9,21.5 C9,21.224 9.224,21 9.5,21 L14.5,21 C14.776,21 15,21.224 15,21.5 C15,21.776 14.776,22 14.5,22 Z M13.5,24 L10.5,24 C10.224,24 10,23.776 10,23.5 C10,23.224 10.224,23 10.5,23 L13.5,23 C13.776,23 14,23.224 14,23.5 C14,23.776 13.776,24 13.5,24 Z"
})));
Lightbulb.displayName = "DecorativeIcon";

const LocationAdd = props => {
  return /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "24",
    viewBox: "0 0 18 24"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    transform: "translate(-3)",
    d: "M12.5,9 L12.5,10.5 C12.5,10.776 12.276,11 12,11 C11.724,11 11.5,10.776 11.5,10.5 L11.5,9 L10,9 C9.724,9 9.5,8.776 9.5,8.5 C9.5,8.224 9.724,8 10,8 L11.5,8 L11.5,6.5 C11.5,6.224 11.724,6 12,6 C12.276,6 12.5,6.224 12.5,6.5 L12.5,8 L14,8 C14.276,8 14.5,8.224 14.5,8.5 C14.5,8.776 14.276,9 14,9 L12.5,9 Z M12,24 C11.884,24 11.767,23.959 11.673,23.878 C11.339,23.59 3.5,16.718 3.5,8.5 C3.5,3.813 7.313,0 12,0 C16.687,0 20.5,3.813 20.5,8.5 C20.5,16.718 12.661,23.59 12.327,23.878 C12.233,23.959 12.116,24 12,24 Z M12,1 C7.864,1 4.5,4.364 4.5,8.5 C4.5,15.342 10.516,21.426 12,22.822 C13.483,21.425 19.5,15.334 19.5,8.5 C19.5,4.364 16.136,1 12,1 Z M12,14 C8.968,14 6.5,11.533 6.5,8.5 C6.5,5.467 8.968,3 12,3 C15.032,3 17.5,5.467 17.5,8.5 C17.5,11.533 15.032,14 12,14 Z M12,4 C9.519,4 7.5,6.019 7.5,8.5 C7.5,10.981 9.519,13 12,13 C14.481,13 16.5,10.981 16.5,8.5 C16.5,6.019 14.481,4 12,4 Z"
  })));
};
LocationAdd.displayName = "DecorativeIcon";

const LocationHome = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M12,24 C11.883,24 11.767,23.959 11.673,23.878 C11.339,23.59 3.5,16.718 3.5,8.5 C3.5,3.813 7.313,0 12,0 C16.687,0 20.5,3.813 20.5,8.5 C20.5,16.718 12.661,23.59 12.327,23.878 C12.233,23.959 12.117,24 12,24 Z M12,1 C7.864,1 4.5,4.364 4.5,8.5 C4.5,15.342 10.516,21.426 12,22.822 C13.483,21.425 19.5,15.334 19.5,8.5 C19.5,4.364 16.136,1 12,1 Z M15,13 L13,13 C12.724,13 12.5,12.776 12.5,12.5 L12.5,10 L11.5,10 L11.5,12.5 C11.5,12.776 11.276,13 11,13 L9,13 C8.724,13 8.5,12.776 8.5,12.5 L8.5,9 L8,9 C7.798,9 7.615,8.878 7.538,8.691 C7.46,8.504 7.503,8.29 7.646,8.146 L11.646,4.146 C11.841,3.951 12.158,3.951 12.353,4.146 L16.353,8.146 C16.496,8.289 16.539,8.504 16.461,8.691 C16.385,8.878 16.202,9 16,9 L15.5,9 L15.5,12.5 C15.5,12.776 15.276,13 15,13 Z M13.5,12 L14.5,12 L14.5,8.5 C14.5,8.286 14.635,8.103 14.825,8.032 L12,5.207 L9.175,8.032 C9.365,8.103 9.5,8.286 9.5,8.5 L9.5,12 L10.5,12 L10.5,9.5 C10.5,9.224 10.724,9 11,9 L13,9 C13.276,9 13.5,9.224 13.5,9.5 L13.5,12 Z"
})));
LocationHome.displayName = "DecorativeIcon";

const LocationMap = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M11.9998303,11 C10.0698303,11 8.49983029,9.43 8.49983029,7.5 C8.49983029,5.57 10.0698303,4 11.9998303,4 C13.9298303,4 15.4998303,5.57 15.4998303,7.5 C15.4998303,9.43 13.9298303,11 11.9998303,11 Z M11.9998303,5 C10.6208303,5 9.49983029,6.121 9.49983029,7.5 C9.49983029,8.879 10.6208303,10 11.9998303,10 C13.3788303,10 14.4998303,8.879 14.4998303,7.5 C14.4998303,6.121 13.3788303,5 11.9998303,5 Z M22.9998303,24 L0.999830289,24 C0.814830289,24 0.645830289,23.898 0.559830289,23.736 C0.471830289,23.573 0.481830289,23.376 0.583830289,23.222 L4.58383029,17.222 C4.67683029,17.084 4.83283029,17 4.99983029,17 L9.84983029,17 C10.1258303,17 10.3498303,17.224 10.3498303,17.5 C10.3498303,17.776 10.1258303,18 9.84983029,18 L5.26783029,18 L1.93483029,23 L22.0658303,23 L18.7328303,18 L14.1498303,18 C13.8738303,18 13.6498303,17.776 13.6498303,17.5 C13.6498303,17.224 13.8738303,17 14.1498303,17 L18.9998303,17 C19.1668303,17 19.3228303,17.084 19.4158303,17.223 L23.4158303,23.223 C23.5188303,23.376 23.5278303,23.574 23.4398303,23.737 C23.3538303,23.898 23.1848303,24 22.9998303,24 Z M11.9998303,21 C11.8448303,21 11.6978303,20.928 11.6038303,20.804 C11.3128303,20.426 4.49983029,11.49 4.49983029,7.5 C4.49983029,3.364 7.86383029,2.84217094e-14 11.9998303,2.84217094e-14 C16.1358303,2.84217094e-14 19.4998303,3.364 19.4998303,7.5 C19.4998303,11.49 12.6868303,20.426 12.3958303,20.804 C12.3018303,20.928 12.1548303,21 11.9998303,21 Z M11.9998303,1 C8.41583029,1 5.49983029,3.916 5.49983029,7.5 C5.49983029,10.636 10.5318303,17.678 11.9998303,19.665 C13.4678303,17.678 18.4998303,10.636 18.4998303,7.5 C18.4998303,3.916 15.5838303,1 11.9998303,1 Z"
})));
LocationMap.displayName = "DecorativeIcon";

const LocationRegular = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(-3)",
  d: "M12,14 C8.968,14 6.5,11.533 6.5,8.5 C6.5,5.467 8.968,3 12,3 C15.032,3 17.5,5.467 17.5,8.5 C17.5,11.533 15.032,14 12,14 Z M12,4 C9.519,4 7.5,6.019 7.5,8.5 C7.5,10.981 9.519,13 12,13 C14.481,13 16.5,10.981 16.5,8.5 C16.5,6.019 14.481,4 12,4 Z M12,14 C8.968,14 6.5,11.533 6.5,8.5 C6.5,5.467 8.968,3 12,3 C15.032,3 17.5,5.467 17.5,8.5 C17.5,11.533 15.032,14 12,14 Z M12,4 C9.519,4 7.5,6.019 7.5,8.5 C7.5,10.981 9.519,13 12,13 C14.481,13 16.5,10.981 16.5,8.5 C16.5,6.019 14.481,4 12,4 Z M12,24 C11.884,24 11.767,23.959 11.673,23.878 C11.339,23.59 3.5,16.718 3.5,8.5 C3.5,3.813 7.313,0 12,0 C16.687,0 20.5,3.813 20.5,8.5 C20.5,16.718 12.661,23.59 12.327,23.878 C12.233,23.959 12.116,24 12,24 Z M12,1 C7.864,1 4.5,4.364 4.5,8.5 C4.5,15.342 10.516,21.426 12,22.822 C13.483,21.425 19.5,15.334 19.5,8.5 C19.5,4.364 16.136,1 12,1 Z"
})));
LocationRegular.displayName = "DecorativeIcon";

const LocationRemove = props => {
  return /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "24",
    viewBox: "0 0 18 24"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    transform: "translate(-3)",
    d: "M11.9995,9.2075 L10.353,10.854 C10.256,10.951 10.128,11 10,11 C9.872,11 9.744,10.951 9.646,10.854 C9.451,10.659 9.451,10.342 9.646,10.147 L11.2925,8.5005 L9.646,6.854 C9.451,6.659 9.451,6.342 9.646,6.147 C9.841,5.952 10.158,5.952 10.353,6.147 L11.9995,7.7935 L13.646,6.147 C13.841,5.952 14.158,5.952 14.353,6.147 C14.548,6.342 14.548,6.659 14.353,6.854 L12.7065,8.5005 L14.353,10.147 C14.548,10.342 14.548,10.659 14.353,10.854 C14.256,10.951 14.128,11 14,11 C13.872,11 13.744,10.951 13.646,10.854 L11.9995,9.2075 Z M12,24 C11.884,24 11.767,23.959 11.673,23.878 C11.339,23.59 3.5,16.718 3.5,8.5 C3.5,3.813 7.313,0 12,0 C16.687,0 20.5,3.813 20.5,8.5 C20.5,16.718 12.661,23.59 12.327,23.878 C12.233,23.959 12.116,24 12,24 Z M12,1 C7.864,1 4.5,4.364 4.5,8.5 C4.5,15.342 10.516,21.426 12,22.822 C13.483,21.425 19.5,15.334 19.5,8.5 C19.5,4.364 16.136,1 12,1 Z M12,14 C8.968,14 6.5,11.533 6.5,8.5 C6.5,5.467 8.968,3 12,3 C15.032,3 17.5,5.467 17.5,8.5 C17.5,11.533 15.032,14 12,14 Z M12,4 C9.519,4 7.5,6.019 7.5,8.5 C7.5,10.981 9.519,13 12,13 C14.481,13 16.5,10.981 16.5,8.5 C16.5,6.019 14.481,4 12,4 Z"
  })));
};
LocationRemove.displayName = "DecorativeIcon";

const LocationVerified = props => {
  return /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "24",
    viewBox: "0 0 18 24"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    transform: "translate(-3)",
    d: "M12,24 C11.884,24 11.767,23.959 11.673,23.878 C11.339,23.59 3.5,16.718 3.5,8.5 C3.5,3.813 7.313,0 12,0 C16.687,0 20.5,3.813 20.5,8.5 C20.5,16.718 12.661,23.59 12.327,23.878 C12.233,23.959 12.116,24 12,24 Z M12,1 C7.864,1 4.5,4.364 4.5,8.5 C4.5,15.342 10.516,21.426 12,22.822 C13.483,21.425 19.5,15.334 19.5,8.5 C19.5,4.364 16.136,1 12,1 Z M12,14 C8.968,14 6.5,11.533 6.5,8.5 C6.5,5.467 8.968,3 12,3 C15.032,3 17.5,5.467 17.5,8.5 C17.5,11.533 15.032,14 12,14 Z M12,4 C9.519,4 7.5,6.019 7.5,8.5 C7.5,10.981 9.519,13 12,13 C14.481,13 16.5,10.981 16.5,8.5 C16.5,6.019 14.481,4 12,4 Z M11,11 C10.872,11 10.744,10.951 10.646,10.854 L8.646,8.854 C8.451,8.659 8.451,8.342 8.646,8.147 C8.841,7.952 9.158,7.952 9.353,8.147 L11,9.793 L14.646,6.147 C14.841,5.952 15.158,5.952 15.353,6.147 C15.548,6.342 15.548,6.659 15.353,6.854 L11.353,10.854 C11.256,10.951 11.128,11 11,11 Z"
  })));
};
LocationVerified.displayName = "DecorativeIcon";

const LockClosed = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M12.6348,16.3315 C12.9848,15.9815 12.9848,15.4125 12.6348,15.0615 C12.4658,14.8925 12.2398,14.7995 11.9998,14.7995 C11.7598,14.7995 11.5338,14.8925 11.3648,15.0605 C11.0148,15.4125 11.0148,15.9815 11.3648,16.3315 C11.6878,16.6535 12.3128,16.6525 12.6348,16.3325 L12.6348,16.3315 Z M11.9988,13.7765 C12.5208,13.7765 13.0198,13.9775 13.3688,14.3275 C13.7348,14.6915 13.9358,15.1785 13.9358,15.6965 C13.9358,16.2155 13.7348,16.7015 13.3678,17.0665 C13.1338,17.3015 12.8418,17.4725 12.5198,17.5605 L12.5198,19.9405 C12.5198,20.2275 12.2868,20.4605 11.9998,20.4605 C11.7138,20.4605 11.4808,20.2275 11.4808,19.9405 L11.4808,17.5605 C11.1578,17.4715 10.8648,17.3015 10.6308,17.0655 C10.2648,16.7015 10.0638,16.2155 10.0638,15.6965 C10.0638,15.1785 10.2648,14.6915 10.6308,14.3265 C10.9798,13.9775 11.4788,13.7765 11.9988,13.7765 Z M19.794,21.896 L19.794,12.395 C19.794,11.809 19.316,11.332 18.73,11.332 L5.271,11.332 C4.684,11.332 4.206,11.809 4.206,12.395 L4.206,21.896 C4.206,22.483 4.684,22.96 5.271,22.96 L18.73,22.96 C19.316,22.96 19.794,22.483 19.794,21.896 Z M6.582,6.457 L6.582,10.292 L17.419,10.292 L17.419,6.457 C17.419,3.469 14.988,1.039 12,1.039 C9.012,1.039 6.582,3.469 6.582,6.457 Z M18.73,10.292 C19.89,10.292 20.833,11.235 20.833,12.395 L20.833,21.896 C20.833,23.056 19.89,24 18.73,24 L5.271,24 C4.11,24 3.167,23.056 3.167,21.896 L3.167,12.395 C3.167,11.235 4.11,10.292 5.271,10.292 L5.543,10.292 L5.543,6.457 C5.543,2.896 8.44,0 12,0 C15.561,0 18.458,2.896 18.458,6.457 L18.458,10.292 L18.73,10.292 Z"
})));
LockClosed.displayName = "DecorativeIcon";

const LockOpened = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M12.6348,16.3315 L12.6348,16.3325 C12.3128,16.6525 11.6878,16.6535 11.3648,16.3315 C11.0148,15.9815 11.0148,15.4125 11.3648,15.0605 C11.5338,14.8925 11.7598,14.7995 11.9998,14.7995 C12.2398,14.7995 12.4658,14.8925 12.6348,15.0615 C12.9848,15.4125 12.9848,15.9815 12.6348,16.3315 M11.9988,13.7765 C12.5208,13.7765 13.0198,13.9775 13.3688,14.3275 C13.7348,14.6915 13.9358,15.1785 13.9358,15.6965 C13.9358,16.2155 13.7348,16.7015 13.3678,17.0665 C13.1338,17.3015 12.8418,17.4725 12.5198,17.5605 L12.5198,19.9405 C12.5198,20.2275 12.2868,20.4605 11.9998,20.4605 C11.7138,20.4605 11.4808,20.2275 11.4808,19.9405 L11.4808,17.5605 C11.1578,17.4715 10.8648,17.3015 10.6308,17.0655 C10.2648,16.7015 10.0638,16.2155 10.0638,15.6965 C10.0638,15.1785 10.2648,14.6915 10.6308,14.3265 C10.9798,13.9775 11.4788,13.7765 11.9988,13.7765 Z M19.794,21.896 L19.794,12.395 C19.794,11.809 19.316,11.332 18.73,11.332 L5.271,11.332 C4.684,11.332 4.206,11.809 4.206,12.395 L4.206,21.896 C4.206,22.483 4.684,22.96 5.271,22.96 L18.73,22.96 C19.316,22.96 19.794,22.483 19.794,21.896 Z M18.73,10.292 C19.89,10.292 20.833,11.235 20.833,12.395 L20.833,21.896 C20.833,23.056 19.89,24 18.73,24 L5.271,24 C4.11,24 3.167,23.056 3.167,21.896 L3.167,12.395 C3.167,11.235 4.11,10.292 5.271,10.292 L5.543,10.292 L5.543,6.457 C5.543,2.896 8.44,0 12,0 C15.561,0 18.458,2.896 18.458,6.457 C18.458,6.749 18.231,6.977 17.939,6.977 C17.647,6.977 17.418,6.749 17.418,6.457 C17.418,3.469 14.987,1.039 12,1.039 C9.012,1.039 6.582,3.469 6.582,6.457 L6.582,10.292 L18.73,10.292 Z"
})));
LockOpened.displayName = "DecorativeIcon";

const Login$1 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "25px",
  height: "26px",
  viewBox: "0 0 25 26",
  version: "1.1"
}, /*#__PURE__*/React.createElement("g", {
  id: "MVP-1",
  stroke: "none",
  strokeWidth: "1",
  fill: "none",
  fillRule: "evenodd"
}, /*#__PURE__*/React.createElement("g", {
  id: "XL-RA_Mobility-Services-w.Banner",
  transform: "translate(-749.000000, -500.000000)",
  fill: "#4B286D"
}, /*#__PURE__*/React.createElement("g", {
  id: "Group-5-Copy",
  transform: "translate(136.000000, 455.000000)"
}, /*#__PURE__*/React.createElement("g", {
  id: "Group",
  transform: "translate(614.000000, 46.000000)"
}, /*#__PURE__*/React.createElement("path", {
  d: "M16.0005,23.0001 L23.0005,23.0001 L23.0005,18.0001 L16.0005,18.0001 L16.0005,23.0001 Z M23.5005,24.0001 L15.5005,24.0001 C15.2235,24.0001 15.0005,23.7761 15.0005,23.5001 L15.0005,17.5001 C15.0005,17.2241 15.2235,17.0001 15.5005,17.0001 L23.5005,17.0001 C23.7765,17.0001 24.0005,17.2241 24.0005,17.5001 L24.0005,23.5001 C24.0005,23.7761 23.7765,24.0001 23.5005,24.0001 L23.5005,24.0001 Z",
  id: "Fill-3184"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.5,22 C19.224,22 19,21.776 19,21.5 L19,20 C19,19.724 19.224,19.5 19.5,19.5 C19.776,19.5 20,19.724 20,20 L20,21.5 C20,21.776 19.776,22 19.5,22",
  id: "Fill-3185"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19.5,19.999 L19.5,20 L20,20 L19.5,19.999 Z M19.5,21 C18.949,21 18.5,20.552 18.5,20 C18.5,19.448 18.949,19 19.5,19 C20.051,19 20.5,19.448 20.5,20 C20.5,20.552 20.051,21 19.5,21 L19.5,21 Z",
  id: "Fill-3186"
}), /*#__PURE__*/React.createElement("path", {
  d: "M13.5,24 L0.5,24 C0.224,24 0,23.776 0,23.5 L0,21.098 C0,21.057 0.005,21.016 0.015,20.977 C0.276,19.933 0.686,18.911 1.904,18.505 L6.342,17.025 C7.385,16.59 7.873,14.863 7.978,14.208 C7.213,13.506 6.5,12.449 6.5,11.5 C6.5,11.146 6.395,11 6.339,10.973 C6.184,10.934 6.095,10.835 6.036,10.686 C5.981,10.549 5.5,9.322 5.5,8.5 C5.5,8.459 5.505,8.418 5.515,8.379 C5.57,8.159 5.723,7.839 6,7.651 L6,5 C6,2.912 7.902,0 11,0 C14.06,0 14.892,1.569 14.99,2.345 C15.508,2.729 16,3.389 16,5 L16,7.651 C16.277,7.839 16.43,8.159 16.485,8.379 C16.495,8.418 16.5,8.459 16.5,8.5 C16.5,9.322 16.019,10.549 15.964,10.686 C15.905,10.835 15.777,10.946 15.621,10.985 C15.605,11 15.5,11.146 15.5,11.5 C15.5,12.449 14.788,13.505 14.024,14.207 C14.064,14.448 14.156,14.857 14.334,15.321 C14.432,15.579 14.303,15.868 14.045,15.967 C13.787,16.064 13.498,15.937 13.399,15.679 C13.14,14.999 13,14.307 13,14 C13,13.851 13.066,13.71 13.182,13.614 C13.837,13.073 14.5,12.173 14.5,11.5 C14.5,10.753 14.809,10.339 15.101,10.143 C15.245,9.751 15.474,9.039 15.498,8.575 C15.481,8.536 15.457,8.495 15.441,8.481 C15.165,8.481 15,8.276 15,8 L15,5 C15,3.528 14.527,3.229 14.325,3.1 C14.204,3.022 14.001,2.894 13.97,2.619 C13.964,2.56 13.973,2.492 13.993,2.424 C13.921,2.027 13.321,1 11,1 C8.558,1 7,3.369 7,5 L7,8 C7,8.276 6.776,8.5 6.5,8.5 C6.524,8.5 6.515,8.534 6.502,8.572 C6.525,9.038 6.755,9.751 6.899,10.143 C7.191,10.338 7.5,10.753 7.5,11.5 C7.5,12.173 8.163,13.073 8.818,13.614 C8.934,13.71 9,13.851 9,14 C9,14.635 8.423,17.24 6.692,17.962 L2.221,19.454 C1.512,19.69 1.231,20.259 1,21.16 L1,23 L13.5,23 C13.776,23 14,23.224 14,23.5 C14,23.776 13.776,24 13.5,24",
  id: "Fill-3187",
  stroke: "#4B286D",
  strokeWidth: "0.25"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22.5,18 C22.224,18 22,17.776 22,17.5 L22,16.5 C22,15.121 20.878,14 19.5,14 C18.122,14 17,15.121 17,16.5 L17,17.5 C17,17.776 16.776,18 16.5,18 C16.224,18 16,17.776 16,17.5 L16,16.5 C16,14.57 17.57,13 19.5,13 C21.43,13 23,14.57 23,16.5 L23,17.5 C23,17.776 22.776,18 22.5,18",
  id: "Fill-3188"
})))))));
Login$1.displayName = "DecorativeIcon";

const LoginForm = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M10.6709,4.3261 C9.9379,5.0591 9.9379,6.2511 10.6709,6.9841 C11.4039,7.7161 12.5959,7.7161 13.3289,6.9841 C14.0619,6.2511 14.0619,5.0591 13.3289,4.3261 C12.9629,3.9601 12.4819,3.7761 11.9999,3.7761 C11.5189,3.7761 11.0379,3.9601 10.6709,4.3261 Z M11.9999,8.5331 C11.2629,8.5331 10.5249,8.2521 9.9639,7.6911 C8.8409,6.5681 8.8409,4.7421 9.9639,3.6191 C11.0869,2.4961 12.9129,2.4961 14.0359,3.6191 C15.1579,4.7421 15.1579,6.5681 14.0359,7.6911 C13.4749,8.2521 12.7369,8.5331 11.9999,8.5331 Z M6.8447,14.0858 C6.5687,14.0858 6.3447,13.8618 6.3447,13.5858 L6.3447,11.9998 C6.3447,10.3848 7.6097,9.1208 9.2237,9.1208 L14.7757,9.1208 C16.3907,9.1208 17.6557,10.3848 17.6557,11.9998 L17.6557,13.5858 C17.6557,13.8618 17.4317,14.0858 17.1557,14.0858 C16.8787,14.0858 16.6557,13.8618 16.6557,13.5858 L16.6557,11.9998 C16.6557,10.9288 15.8467,10.1208 14.7757,10.1208 L9.2237,10.1208 C8.1527,10.1208 7.3447,10.9288 7.3447,11.9998 L7.3447,13.5858 C7.3447,13.8618 7.1207,14.0858 6.8447,14.0858 Z M20.2246,19.1376 L20.2246,16.7586 C20.2246,16.1596 19.7376,15.6726 19.1376,15.6726 L4.8626,15.6726 C4.2636,15.6726 3.7756,16.1596 3.7756,16.7586 L3.7756,19.1376 C3.7756,19.7376 4.2636,20.2246 4.8626,20.2246 L19.1376,20.2246 C19.7376,20.2246 20.2246,19.7376 20.2246,19.1376 Z M19.1376,14.6726 C20.2876,14.6726 21.2246,15.6086 21.2246,16.7586 L21.2246,19.1376 C21.2246,20.2876 20.2876,21.2246 19.1376,21.2246 L4.8626,21.2246 C3.7116,21.2246 2.7756,20.2876 2.7756,19.1376 L2.7756,16.7586 C2.7756,15.6086 3.7116,14.6726 4.8626,14.6726 L19.1376,14.6726 Z M7.5947,16.4052 C7.7897,16.6002 7.7897,16.9172 7.5947,17.1122 L6.7587,17.9482 L7.5947,18.7842 C7.7897,18.9792 7.7897,19.2962 7.5947,19.4912 C7.4967,19.5892 7.3687,19.6372 7.2407,19.6372 C7.1137,19.6372 6.9857,19.5892 6.8877,19.4912 L6.0517,18.6552 L5.2157,19.4912 C5.1177,19.5892 4.9907,19.6372 4.8627,19.6372 C4.7347,19.6372 4.6067,19.5892 4.5087,19.4912 C4.3137,19.2962 4.3137,18.9792 4.5087,18.7842 L5.3447,17.9482 L4.5087,17.1122 C4.3137,16.9172 4.3137,16.6002 4.5087,16.4052 C4.7037,16.2102 5.0207,16.2102 5.2157,16.4052 L6.0517,17.2412 L6.8877,16.4052 C7.0827,16.2102 7.3997,16.2102 7.5947,16.4052 Z M11.5605,16.4052 C11.7555,16.6002 11.7555,16.9172 11.5605,17.1122 L10.7245,17.9482 L11.5605,18.7842 C11.7555,18.9792 11.7555,19.2962 11.5605,19.4912 C11.4625,19.5892 11.3345,19.6372 11.2065,19.6372 C11.0795,19.6372 10.9515,19.5892 10.8535,19.4912 L10.0175,18.6552 L9.1815,19.4912 C9.0835,19.5892 8.9555,19.6372 8.8275,19.6372 C8.6995,19.6372 8.5715,19.5892 8.4745,19.4912 C8.2785,19.2962 8.2785,18.9792 8.4745,18.7842 L9.3105,17.9482 L8.4745,17.1122 C8.2785,16.9172 8.2785,16.6002 8.4745,16.4052 C8.6695,16.2102 8.9855,16.2102 9.1815,16.4052 L10.0175,17.2412 L10.8535,16.4052 C11.0485,16.2102 11.3655,16.2102 11.5605,16.4052 Z M15.5264,16.4052 C15.7214,16.6002 15.7214,16.9172 15.5264,17.1122 L14.6904,17.9482 L15.5264,18.7842 C15.7214,18.9792 15.7214,19.2962 15.5264,19.4912 C15.4284,19.5892 15.3004,19.6372 15.1724,19.6372 C15.0454,19.6372 14.9174,19.5892 14.8194,19.4912 L13.9824,18.6552 L13.1464,19.4912 C13.0484,19.5892 12.9214,19.6372 12.7934,19.6372 C12.6654,19.6372 12.5374,19.5892 12.4394,19.4912 C12.2444,19.2962 12.2444,18.9792 12.4394,18.7842 L13.2754,17.9482 L12.4394,17.1122 C12.2444,16.9172 12.2444,16.6002 12.4394,16.4052 C12.6344,16.2102 12.9514,16.2102 13.1464,16.4052 L13.9824,17.2412 L14.8194,16.4052 C15.0144,16.2102 15.3314,16.2102 15.5264,16.4052 Z M19.4912,16.4052 C19.6862,16.6002 19.6862,16.9172 19.4912,17.1122 L18.6552,17.9482 L19.4912,18.7842 C19.6862,18.9792 19.6862,19.2962 19.4912,19.4912 C19.3932,19.5892 19.2652,19.6372 19.1372,19.6372 C19.0102,19.6372 18.8822,19.5892 18.7842,19.4912 L17.9482,18.6552 L17.1122,19.4912 C17.0142,19.5892 16.8872,19.6372 16.7592,19.6372 C16.6312,19.6372 16.5032,19.5892 16.4052,19.4912 C16.2102,19.2962 16.2102,18.9792 16.4052,18.7842 L17.2412,17.9482 L16.4052,17.1122 C16.2102,16.9172 16.2102,16.6002 16.4052,16.4052 C16.6002,16.2102 16.9172,16.2102 17.1122,16.4052 L17.9482,17.2412 L18.7842,16.4052 C18.9792,16.2102 19.2962,16.2102 19.4912,16.4052 Z M23,21.914 L23,2.086 C23,1.487 22.513,1 21.914,1 L2.086,1 C1.487,1 1,1.487 1,2.086 L1,21.914 C1,22.513 1.487,23 2.086,23 L21.914,23 C22.513,23 23,22.513 23,21.914 Z M21.914,-2.84217094e-14 C23.064,-2.84217094e-14 24,0.936 24,2.086 L24,21.914 C24,23.064 23.064,24 21.914,24 L2.086,24 C0.936,24 0,23.064 0,21.914 L0,2.086 C0,0.936 0.936,-2.84217094e-14 2.086,-2.84217094e-14 L21.914,-2.84217094e-14 Z"
})));
LoginForm.displayName = "DecorativeIcon";

const Map$1 = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M1,5.979875 L1,20.747875 L7.138,18.019875 L7.138,3.251875 L1,5.979875 Z M16.862,5.979875 L16.862,20.747875 L23,18.019875 L23,3.251875 L16.862,5.979875 Z M8.138,17.993875 L15.862,20.803875 L15.862,6.004875 L8.138,3.196875 L8.138,17.993875 Z M16.362,22.017875 C16.298,22.017875 16.236,22.005875 16.181,21.982875 L7.656,18.883875 L0.703,21.974875 C0.549,22.041875 0.37,22.027875 0.228,21.936875 C0.085,21.844875 0,21.686875 0,21.517875 L0,5.654875 C0,5.457875 0.116,5.278875 0.297,5.197875 L7.425,2.029875 C7.487,2.000875 7.556,1.983875 7.628,1.982875 C7.634,1.981875 7.642,1.981875 7.649,1.982875 C7.709,1.983875 7.766,1.995875 7.819,2.016875 L16.344,5.115875 L23.297,2.025875 C23.451,1.956875 23.631,1.970875 23.772,2.062875 C23.914,2.155875 24,2.312875 24,2.482875 L24,18.344875 C24,18.541875 23.884,18.721875 23.703,18.801875 L16.575,21.969875 C16.511,22.000875 16.438,22.017875 16.362,22.017875 L16.362,22.017875 Z"
})));
Map$1.displayName = "DecorativeIcon";

const Medical = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M21.914,3.965 C23.064,3.965 24,4.901 24,6.052 L24,21.121 C24,22.271 23.064,23.207 21.914,23.207 L2.086,23.207 C0.936,23.207 0,22.271 0,21.121 L0,6.052 C0,4.901 0.936,3.965 2.086,3.965 L7.138,3.965 L7.138,2.879 C7.138,1.729 8.074,0.793 9.224,0.793 L14.775,0.793 C15.926,0.793 16.862,1.729 16.862,2.879 L16.862,3.965 L21.914,3.965 Z M23,21.121 L23,6.052 C23,5.453 22.513,4.965 21.914,4.965 L2.086,4.965 C1.487,4.965 1,5.453 1,6.052 L1,21.121 C1,21.72 1.487,22.207 2.086,22.207 L21.914,22.207 C22.513,22.207 23,21.72 23,21.121 Z M8.138,2.879 L8.138,3.965 L15.862,3.965 L15.862,2.879 C15.862,2.28 15.375,1.793 14.775,1.793 L9.224,1.793 C8.625,1.793 8.138,2.28 8.138,2.879 Z M15.8525,17.4383 C16.8815,16.4093 17.4485,15.0423 17.4485,13.5853 C17.4485,12.1303 16.8815,10.7623 15.8525,9.7333 C14.8235,8.7043 13.4555,8.1373 11.9995,8.1373 C10.5445,8.1373 9.1765,8.7043 8.1475,9.7333 C7.1185,10.7623 6.5515,12.1303 6.5515,13.5853 C6.5515,15.0423 7.1185,16.4103 8.1475,17.4383 C9.1765,18.4673 10.5445,19.0343 11.9995,19.0343 C13.4555,19.0343 14.8235,18.4673 15.8525,17.4383 Z M11.9995,7.1373 C13.7225,7.1373 15.3415,7.8083 16.5595,9.0263 C17.7775,10.2443 18.4485,11.8633 18.4485,13.5853 C18.4485,15.3083 17.7775,16.9273 16.5595,18.1453 C15.3415,19.3633 13.7225,20.0343 11.9995,20.0343 C10.2775,20.0343 8.6585,19.3633 7.4405,18.1453 C6.2225,16.9273 5.5515,15.3083 5.5515,13.5853 C5.5515,11.8633 6.2225,10.2443 7.4405,9.0263 C8.6585,7.8083 10.2775,7.1373 11.9995,7.1373 Z M14.7754,13.0858 C15.0514,13.0858 15.2754,13.3098 15.2754,13.5858 C15.2754,13.8618 15.0514,14.0858 14.7754,14.0858 L12.5004,14.0858 L12.5004,16.3618 C12.5004,16.6388 12.2764,16.8618 12.0004,16.8618 C11.7234,16.8618 11.5004,16.6388 11.5004,16.3618 L11.5004,14.0858 L9.2244,14.0858 C8.9474,14.0858 8.7244,13.8618 8.7244,13.5858 C8.7244,13.3098 8.9474,13.0858 9.2244,13.0858 L11.5004,13.0858 L11.5004,10.8108 C11.5004,10.5338 11.7234,10.3108 12.0004,10.3108 C12.2764,10.3108 12.5004,10.5338 12.5004,10.8108 L12.5004,13.0858 L14.7754,13.0858 Z"
})));
Medical.displayName = "DecorativeIcon";

const Messaging = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -4)",
  d: "M17,11.5 L17,8.5 C17,6.019 14.981,4 12.5,4 L4.5,4 C2.019,4 0,6.019 0,8.5 L0,11.5 C0,13.981 2.019,16 4.5,16 L5,16 L5,18.5 C5,18.702 5.122,18.885 5.309,18.962 C5.37,18.988 5.436,19 5.5,19 C5.63,19 5.758,18.949 5.853,18.854 L8.707,16 L12.5,16 C14.981,16 17,13.981 17,11.5 Z M8.5,15 C8.367,15 8.24,15.053 8.146,15.147 L6,17.293 L6,15.5 C6,15.224 5.776,15 5.5,15 L4.5,15 C2.57,15 1,13.43 1,11.5 L1,8.5 C1,6.57 2.57,5 4.5,5 L12.5,5 C14.43,5 16,6.57 16,8.5 L16,11.5 C16,13.43 14.43,15 12.5,15 L8.5,15 Z M19.5,7 L18.549,7 C18.273,7 18.049,7.224 18.049,7.5 C18.049,7.776 18.273,8 18.549,8 L19.5,8 C21.43,8 23,9.57 23,11.5 L23,14.5 C23,16.43 21.43,18 19.5,18 L18.5,18 C18.224,18 18,18.224 18,18.5 L18,20.293 L15.854,18.146 C15.76,18.053 15.633,18 15.5,18 L11.5,18 C10.782,18 10.089,17.777 9.494,17.355 C9.271,17.196 8.958,17.248 8.797,17.473 C8.638,17.698 8.69,18.01 8.916,18.17 C9.681,18.713 10.574,19 11.5,19 L15.293,19 L18.146,21.854 C18.242,21.949 18.37,22 18.5,22 C18.564,22 18.63,21.988 18.691,21.962 C18.878,21.885 19,21.702 19,21.5 L19,19 L19.5,19 C21.981,19 24,16.981 24,14.5 L24,11.5 C24,9.019 21.981,7 19.5,7 Z M10.75,8 L6.25,8 C5.008,8 4,8.224 4,8.5 C4,8.776 5.008,9 6.25,9 L10.75,9 C11.992,9 13,8.776 13,8.5 C13,8.224 11.992,8 10.75,8 Z M10.75,10 L6.25,10 C5.008,10 4,10.224 4,10.5 C4,10.776 5.008,11 6.25,11 L10.75,11 C11.992,11 13,10.776 13,10.5 C13,10.224 11.992,10 10.75,10 Z M7,12 L5,12 C4.448,12 4,12.224 4,12.5 C4,12.776 4.448,13 5,13 L7,13 C7.552,13 8,12.776 8,12.5 C8,12.224 7.552,12 7,12 Z"
})));
Messaging.displayName = "DecorativeIcon";

const Microphone = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24px",
  height: "24px",
  viewBox: "0 0 24 24",
  version: "1.1"
}, /*#__PURE__*/React.createElement("g", {
  id: "[WIP]-Amazon-Alexa-Integration---Sprint-1---May-2021",
  stroke: "none",
  strokeWidth: "1",
  fill: "none",
  fillRule: "evenodd"
}, /*#__PURE__*/React.createElement("g", {
  id: "Artboard",
  transform: "translate(-1208.000000, -170.000000)"
}, /*#__PURE__*/React.createElement("g", {
  id: "microphone-copy-2",
  transform: "translate(1208.000000, 170.000000)"
}, /*#__PURE__*/React.createElement("rect", {
  id: "Rectangle",
  x: "0",
  y: "0",
  width: "24",
  height: "24"
}), /*#__PURE__*/React.createElement("g", {
  id: "mic",
  transform: "translate(5.250000, 0.000000)",
  fill: "#4B286D",
  fillRule: "nonzero"
}, /*#__PURE__*/React.createElement("path", {
  d: "M10.75,23 C11.0261424,23 11.25,23.2238576 11.25,23.5 C11.25,23.7454599 11.0731248,23.9496084 10.8398756,23.9919443 L10.75,24 L2.75,24 C2.47385763,24 2.25,23.7761424 2.25,23.5 C2.25,23.2545401 2.42687516,23.0503916 2.66012437,23.0080557 L2.75,23 L10.75,23 Z",
  id: "Stroke-633"
}), /*#__PURE__*/React.createElement("path", {
  d: "M8.35,0 L5.15,0 C3.54825763,0 2.25,1.29825763 2.25,2.9 L2.25,14.1 C2.25,15.7017424 3.54825763,17 5.15,17 L8.35,17 C9.95174237,17 11.25,15.7017424 11.25,14.1 L11.25,2.9 C11.25,1.29825763 9.95174237,0 8.35,0 Z M5.15,1 L8.35,1 C9.39945763,1 10.25,1.85054237 10.25,2.9 L10.25,14.1 C10.25,15.1494576 9.39945763,16 8.35,16 L5.15,16 C4.10054237,16 3.25,15.1494576 3.25,14.1 L3.25,2.9 C3.25,1.85054237 4.10054237,1 5.15,1 Z",
  id: "Stroke-634"
}), /*#__PURE__*/React.createElement("path", {
  d: "M13,9 C13.2454599,9 13.4496084,9.17687516 13.4919443,9.41012437 L13.5,9.5 L13.5,14.4090909 C13.5,16.8669105 11.6430597,18.8818569 9.30157422,18.9949903 L9.09375,19 L4.40625,19 C2.03744901,19 0.112828719,17.0552771 0.0047841317,14.6247709 L0,14.4090909 L0,9.5 C0,9.22385763 0.223857625,9 0.5,9 C0.745459889,9 0.94960837,9.17687516 0.991944331,9.41012437 L1,9.5 L1,14.4090909 C1,16.3307194 2.4303159,17.8927045 4.2198846,17.9947017 L4.40625,18 L9.09375,18 C10.9068212,18 12.3975728,16.5020692 12.4949417,14.606552 L12.5,14.4090909 L12.5,9.5 C12.5,9.22385763 12.7238576,9 13,9 Z",
  id: "Stroke-635"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6.75,18 C6.99545989,18 7.19960837,18.1768752 7.24194433,18.4101244 L7.25,18.5 L7.25,23.5 C7.25,23.7761424 7.02614237,24 6.75,24 C6.50454011,24 6.30039163,23.8231248 6.25805567,23.5898756 L6.25,23.5 L6.25,18.5 C6.25,18.2238576 6.47385763,18 6.75,18 Z",
  id: "Stroke-636"
})))))));
Microphone.displayName = "DecorativeIcon";

const Mobility = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "14",
  height: "24",
  viewBox: "0 0 14 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-5)",
  d: "M18,18 L18,5 L6,5 L6,18 L18,18 Z M18,19 L6,19 L6,20.5 C6,21.878 7.122,23 8.5,23 L15.5,23 C16.878,23 18,21.878 18,20.5 L18,19 Z M18,4 L18,3.5 C18,2.122 16.878,1 15.5,1 L8.5,1 C7.122,1 6,2.122 6,3.5 L6,4 L18,4 Z M15.5,24 L8.5,24 C6.57,24 5,22.43 5,20.5 L5,3.5 C5,1.57 6.57,0 8.5,0 L15.5,0 C17.43,0 19,1.57 19,3.5 L19,20.5 C19,22.43 17.43,24 15.5,24 Z M12.7071064,20.2928936 C13.0976312,20.6834184 13.0976312,21.3165856 12.7071064,21.7071064 C12.3165816,22.0976312 11.6834144,22.0976312 11.2928936,21.7071064 C10.9023688,21.3165816 10.9023688,20.6834144 11.2928936,20.2928936 C11.6834184,19.9023688 12.3165856,19.9023688 12.7071064,20.2928936 Z M13.5,3 L10.5,3 C10.224,3 10,2.776 10,2.5 C10,2.224 10.224,2 10.5,2 L13.5,2 C13.776,2 14,2.224 14,2.5 C14,2.776 13.776,3 13.5,3 Z M15.5024876,3 C15.2278607,3 15,2.776 15,2.5 C15,2.224 15.2179104,2 15.4925373,2 L15.5024876,2 C15.7771144,2 16,2.224 16,2.5 C16,2.776 15.7771144,3 15.5024876,3 Z"
})));
Mobility.displayName = "DecorativeIcon";

const Movie = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4.924 9.885l.026.115h18.55c.276 0 .5.224.5.5v3c0 .276-.224.5-.5.5h-.5v9.5c0 .276-.224.5-.5.5h-19c-.276 0-.5-.224-.5-.5v-9.5h-.5c-.276 0-.5-.224-.5-.5v-.55c-1.139-.232-2-1.243-2-2.45 0-1.023.619-1.905 1.501-2.292l-.354-.354c-.122-.122-.173-.297-.134-.465.038-.167.16-.304.322-.361l20-7c.125-.044.265-.036.385.023s.212.164.254.291l1 3c.087.262-.054.545-.316.632l-14.98 4.993-.038.013-2.716.905zm-.441-.906l1.89-.63-1.992-1.328-1.965.688.3.3c.718.062 1.35.428 1.767.97zm-1.969.021h-.028c-.821.007-1.487.677-1.487 1.5 0 .827.673 1.5 1.5 1.5s1.5-.673 1.5-1.5c0-.822-.665-1.492-1.486-1.5zm-.514 3.95c.162.033.329.05.5.05.313 0 .612-.058.889-.163.333-.127.632-.324.88-.572.262-.262.466-.581.591-.938l.091-.328h2.343l-2 2h-1.793zm4.707.05h2.586l2-2h-2.586l-2 2zm4 0h2.586l2-2h-2.586l-2 2zm4 0h2.586l2-2h-2.586l-2 2zm4 0h2.586l1.707-1.707v-.293h-2.293l-2 2zm-14.707 1v9h18v-9h-18zm16.5 8h-6c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h6c.276 0 .5.224.5.5s-.224.5-.5.5zm0-3h-6c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h6c.276 0 .5.224.5.5s-.224.5-.5.5zm-9 3h-6c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h6c.276 0 .5.224.5.5s-.224.5-.5.5zm9-6h-6c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h6c.276 0 .5.224.5.5s-.224.5-.5.5zm-9 4c-.276 0-.5-.224-.5-.5v-.5h-1.5c-.161 0-.312-.077-.406-.208-.094-.13-.12-.298-.068-.451l1-3c.087-.262.368-.403.632-.316.262.087.403.37.316.632l-.78 2.343h1.306c.276 0 .5.224.5.5v1c0 .276-.224.5-.5.5zm-5 0h-1c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h1c.276 0 .5-.224.5-.5s-.224-.5-.5-.5h-1c-.276 0-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5h2c.276 0 .5.224.5.5s-.224.5-.5.5h-1.5v1h.5c.827 0 1.5.673 1.5 1.5s-.673 1.5-1.5 1.5zm16.5-7.293l-.293.293h.293v-.293zm-5.13-8.19l-2.287-1.357-.057-.039-2.377.832 2.101 1.247.152.139 2.468-.823zm1.254-.418l2.744-.915-.682-2.044-4.431 1.551 2.334 1.385.035.023zm-4.924 1.641l-2.285-1.356-2.407.843 2.241 1.33 2.451-.817zm-3.706 1.235l-2.219-1.317-2.712.949 2.011 1.341 2.92-.973z"
})));
Movie.displayName = "DecorativeIcon";

const Music = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "24",
  viewBox: "0 0 22 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1)",
  d: "M8.49953443,9.85258853 L8.49953443,20.9592434 C8.51490897,21.3533949 8.40511466,21.7556568 8.1735842,22.1402839 C7.69565717,22.9351626 6.73780341,23.5750649 5.61197529,23.8510227 C5.20103803,23.9520073 4.79709971,24 4.41315832,24 C2.9893757,24 1.82855293,23.3431003 1.5575943,22.2732636 C1.42861399,21.7613418 1.52159979,21.2204244 1.82855293,20.7105022 C2.30647996,19.9156236 3.26433372,19.2757213 4.39016184,18.9997634 C5.58628666,18.7060001 6.72478848,18.860928 7.49968709,19.3445362 L7.49968709,9.51617231 C7.4993214,9.50520117 7.499324,9.4942572 7.49968709,9.48335664 L7.49968709,5.78578086 C7.49968709,5.15387734 7.89962603,4.58596405 8.49553505,4.37299656 L20.4937032,0.0876508273 C20.9516333,-0.0773239851 21.4635551,-0.00633482338 21.8624942,0.274622281 C22.2594336,0.555579386 22.4973973,1.01450932 22.4973973,1.50043513 L22.4973973,4.48204961 C22.4979076,4.49505667 22.4979034,4.50802553 22.4973973,4.52092942 L22.4973973,17.5029919 C22.4973973,17.5653153 22.4859738,17.6249869 22.4651079,17.6800255 C22.5581351,18.1613934 22.4580772,18.6645811 22.1714471,19.1407419 C21.69352,19.9356205 20.7356663,20.5755228 19.6098382,20.8514807 C19.1989009,20.9524653 18.7949626,21.000458 18.4110212,21.000458 C16.9872386,21.000458 15.8264158,20.3435582 15.5554572,19.2737216 C15.4264769,18.7617997 15.5194627,18.2208823 15.8264158,17.7109602 C16.3043428,16.9160815 17.2621966,16.2761792 18.3880247,16.0002214 C19.582961,15.7058258 20.7221903,15.860928 21.49755,16.3447874 L21.49755,5.21044013 L8.49953443,9.85258853 Z M8.49953443,8.79075065 L21.49755,4.14860225 L21.49755,1.50043513 C21.49755,1.33546032 21.4205617,1.18748291 21.2855823,1.09149756 C21.1506029,0.995512219 20.9836284,0.974515425 20.8286521,1.02850718 L8.83048391,5.31385291 C8.63251413,5.38584192 8.49953443,5.57481307 8.49953443,5.78578086 L8.49953443,8.79075065 Z M7.49968709,20.9945528 C7.49742801,20.9381234 7.48953941,20.8805799 7.4746909,20.8224851 C7.32171426,20.2225767 6.53583424,19.8526332 5.57998018,19.8526332 C5.27502674,19.8526332 4.95307589,19.8906274 4.6281255,19.9706152 C3.76825678,20.181583 3.02437036,20.6625096 2.68542211,21.2254236 C2.56943981,21.4183941 2.44745844,21.7153488 2.52744623,22.028301 C2.7274157,22.8201801 4.03121664,23.2121203 5.37401163,22.880171 C6.23388034,22.6692032 6.97776677,22.1882766 7.31671502,21.6253625 C7.40677402,21.475523 7.50045007,21.2629878 7.5003781,21.0289497 C7.49991934,21.0201768 7.49968709,21.0113442 7.49968709,21.0024577 L7.49968709,20.9945528 Z M19.577843,16.8530912 C19.2728896,16.8530912 18.9509388,16.8910854 18.6259884,16.9710731 C17.7661197,17.1820409 17.0222332,17.6629675 16.683285,18.2258816 C16.5673027,18.4188521 16.4453213,18.7158068 16.5253091,19.028759 C16.7252786,19.8206381 18.0290795,20.2125782 19.3718745,19.8806289 C20.2317432,19.6696611 20.9756296,19.1887346 21.3145779,18.6258205 C21.4305602,18.43285 21.5525416,18.1358953 21.4725538,17.8229431 C21.3195771,17.2230347 20.5336971,16.8530912 19.577843,16.8530912 Z"
})));
Music.displayName = "DecorativeIcon";

const Networking = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M13.585,12.6577 C14.964,12.6577 16.086,13.7797 16.086,15.1587 L16.086,16.3477 C16.086,16.6347 15.854,16.8677 15.566,16.8677 C15.279,16.8677 15.046,16.6347 15.046,16.3477 L15.046,15.1587 C15.046,14.3527 14.391,13.6977 13.585,13.6977 L10.415,13.6977 C9.609,13.6977 8.954,14.3527 8.954,15.1587 L8.954,16.3477 C8.954,16.6347 8.72,16.8677 8.434,16.8677 C8.147,16.8677 7.914,16.6347 7.914,16.3477 L7.914,15.1587 C7.914,13.7797 9.036,12.6577 10.415,12.6577 L13.585,12.6577 Z M4.3155,8.267 C4.5915,7.991 4.7435,7.624 4.7435,7.234 C4.7435,6.844 4.5915,6.476 4.3155,6.201 C4.0395,5.925 3.6725,5.772 3.2825,5.772 C2.8925,5.772 2.5255,5.925 2.2495,6.201 C1.9735,6.477 1.8215,6.844 1.8215,7.234 C1.8215,7.624 1.9735,7.991 2.2495,8.267 C2.5115,8.529 2.8885,8.68 3.2825,8.68 C3.6765,8.68 4.0535,8.529 4.3155,8.267 Z M3.2825,15.283 C2.8925,15.283 2.5255,15.434 2.2495,15.71 C1.6795,16.28 1.6795,17.206 2.2495,17.776 C2.5115,18.038 2.8885,18.19 3.2825,18.19 C3.6765,18.19 4.0535,18.038 4.3155,17.777 C4.5905,17.501 4.7425,17.134 4.7425,16.743 C4.7425,16.352 4.5905,15.985 4.3155,15.71 C4.0405,15.434 3.6735,15.283 3.2825,15.283 Z M18.3295,17.455 C18.0645,16.568 18.2975,15.626 18.9505,14.975 C19.2905,14.634 19.7195,14.403 20.1975,14.302 L20.1975,9.675 C19.7195,9.575 19.2915,9.344 18.9495,9.002 C18.4765,8.53 18.2165,7.902 18.2165,7.234 C18.2165,7.002 18.2535,6.769 18.3285,6.523 L13.8915,4.103 C13.8525,4.153 13.8135,4.202 13.7685,4.247 C13.2955,4.72 12.6685,4.98 12.0005,4.98 C11.3315,4.98 10.7045,4.72 10.2315,4.247 C10.1865,4.202 10.1475,4.153 10.1075,4.103 L5.6715,6.522 C5.7475,6.769 5.7835,7.002 5.7835,7.234 C5.7835,7.903 5.5235,8.531 5.0515,9.002 C4.7095,9.344 4.2795,9.575 3.8025,9.675 L3.8025,14.322 C4.2905,14.419 4.7205,14.644 5.0515,14.976 C5.7025,15.626 5.9355,16.568 5.6705,17.455 L10.1085,19.875 C10.1465,19.825 10.1855,19.776 10.2315,19.73 C11.1755,18.788 12.8275,18.788 13.7675,19.729 C13.8145,19.776 13.8535,19.825 13.8915,19.875 L18.3295,17.455 Z M19.6835,15.71 C19.1145,16.28 19.1145,17.206 19.6845,17.776 C20.2535,18.347 21.1825,18.346 21.7505,17.776 C22.3205,17.206 22.3205,16.28 21.7505,15.71 C21.4755,15.435 21.1085,15.284 20.7175,15.284 C20.3275,15.284 19.9605,15.435 19.6835,15.71 Z M19.6845,8.267 C20.2535,8.837 21.1825,8.835 21.7505,8.267 C22.0265,7.991 22.1785,7.624 22.1785,7.234 C22.1785,6.844 22.0265,6.477 21.7505,6.201 C21.4755,5.925 21.1085,5.773 20.7175,5.773 C20.3275,5.773 19.9605,5.925 19.6835,6.201 C19.4085,6.476 19.2555,6.843 19.2555,7.234 C19.2555,7.624 19.4085,7.991 19.6845,8.267 Z M12.0005,1.017 C11.6095,1.017 11.2425,1.17 10.9665,1.446 C10.6915,1.722 10.5385,2.089 10.5385,2.479 C10.5385,2.869 10.6915,3.236 10.9665,3.512 C11.5175,4.062 12.4835,4.062 13.0345,3.512 C13.3095,3.235 13.4615,2.869 13.4615,2.479 C13.4615,2.089 13.3095,1.722 13.0335,1.446 C12.7575,1.17 12.3905,1.017 12.0005,1.017 Z M13.0345,22.531 L13.0335,22.531 C13.3085,22.256 13.4605,21.889 13.4605,21.498 C13.4605,21.108 13.3085,20.741 13.0335,20.466 C12.7575,20.189 12.3905,20.038 12.0005,20.038 C11.6095,20.038 11.2425,20.189 10.9665,20.466 C10.6915,20.741 10.5395,21.108 10.5395,21.498 C10.5395,21.889 10.6915,22.256 10.9665,22.531 C11.5175,23.083 12.4835,23.082 13.0345,22.531 Z M21.2375,14.302 C21.7155,14.403 22.1455,14.634 22.4865,14.976 C23.4615,15.951 23.4615,17.538 22.4865,18.512 C22.0145,18.983 21.3865,19.244 20.7175,19.244 C20.0475,19.244 19.4205,18.983 18.9495,18.511 C18.9035,18.466 18.8645,18.416 18.8265,18.368 L14.3875,20.788 C14.6525,21.675 14.4195,22.617 13.7685,23.268 C13.2955,23.741 12.6675,24 12.0005,24 C11.3325,24 10.7045,23.741 10.2315,23.268 C9.5805,22.616 9.3485,21.674 9.6125,20.788 L5.1745,18.368 C5.1365,18.416 5.0975,18.466 5.0515,18.511 C4.5785,18.985 3.9495,19.246 3.2825,19.246 C2.6155,19.246 1.9875,18.985 1.5145,18.512 C0.5395,17.538 0.5395,15.951 1.5145,14.975 C1.8455,14.644 2.2755,14.419 2.7625,14.322 L2.7625,9.675 C2.2855,9.575 1.8555,9.344 1.5145,9.002 C1.0415,8.531 0.7815,7.903 0.7815,7.234 C0.7815,6.565 1.0415,5.937 1.5145,5.466 C1.9655,5.014 2.6095,4.755 3.2825,4.755 C3.9555,4.755 4.6005,5.014 5.0515,5.466 C5.0965,5.511 5.1355,5.56 5.1745,5.61 L9.6105,3.19 C9.5355,2.944 9.4985,2.711 9.4985,2.479 C9.4985,1.811 9.7585,1.183 10.2315,0.71 C10.6825,0.259 11.3265,0 12.0005,0 C12.6735,0 13.3175,0.259 13.7685,0.71 C14.2415,1.183 14.5015,1.811 14.5015,2.479 C14.5015,2.71 14.4645,2.944 14.3885,3.19 L18.8255,5.61 C18.8645,5.559 18.9035,5.511 18.9505,5.465 C19.4205,4.994 20.0485,4.734 20.7175,4.734 C21.3865,4.734 22.0145,4.994 22.4865,5.466 C22.9595,5.938 23.2185,6.566 23.2185,7.234 C23.2185,7.901 22.9595,8.529 22.4865,9.002 C22.1455,9.343 21.7145,9.574 21.2375,9.675 L21.2375,14.302 Z M12.0001,8.1499 C11.6101,8.1499 11.2431,8.3019 10.9671,8.5779 C10.6911,8.8539 10.5391,9.2209 10.5391,9.6109 C10.5391,10.0019 10.6911,10.3689 10.9671,10.6449 C11.5171,11.1959 12.4841,11.1939 13.0341,10.6449 C13.3101,10.3679 13.4611,10.0009 13.4611,9.6109 C13.4611,9.2219 13.3101,8.8549 13.0331,8.5779 C12.7571,8.3019 12.3901,8.1499 12.0001,8.1499 Z M12.0001,12.1129 C11.3321,12.1129 10.7041,11.8519 10.2311,11.3789 C9.7591,10.9079 9.4991,10.2799 9.4991,9.6109 C9.4991,8.9429 9.7591,8.3159 10.2311,7.8429 C10.6821,7.3919 11.3271,7.1329 12.0001,7.1329 C12.6731,7.1329 13.3171,7.3919 13.7691,7.8429 C14.2411,8.3149 14.5011,8.9429 14.5011,9.6109 C14.5011,10.2799 14.2411,10.9079 13.7681,11.3789 C13.2961,11.8519 12.6681,12.1129 12.0001,12.1129 Z"
})));
Networking.displayName = "DecorativeIcon";

const News = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "19",
  viewBox: "0 0 24 19"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -3)",
  d: "M2.5,22 C1.121,22 0,20.879 0,19.5 L0,8.5 C0,7.2921932 0.859947661,6.28230478 2,6.05017771 L2,5.5 C2,4.121 3.121,3 4.5,3 L21.5,3 C22.879,3 24,4.121 24,5.5 L24,19.5 C24,20.879 22.879,22 21.5,22 L2.5,22 Z M2.5,21 L21.5,21 C22.327,21 23,20.327 23,19.5 L23,5.5 C23,4.673 22.327,4 21.5,4 L4.5,4 C3.673,4 3,4.673 3,5.5 L3,19.5 C3,19.776 2.776,20 2.5,20 C2.224,20 2,19.776 2,19.5 L2,7.08570362 C1.41802114,7.29210597 1,7.8482259 1,8.5 L1,19.5 C1,20.327 1.673,21 2.5,21 Z M12.5,19 L4.5,19 C4.224,19 4,18.776 4,18.5 L4,12.5 C4,12.224 4.224,12 4.5,12 L12.5,12 C12.776,12 13,12.224 13,12.5 L13,18.5 C13,18.776 12.776,19 12.5,19 Z M5,18 L12,18 L12,13 L5,13 L5,18 Z M21.5,13 L14.5,13 C14.224,13 14,12.776 14,12.5 C14,12.224 14.224,12 14.5,12 L21.5,12 C21.776,12 22,12.224 22,12.5 C22,12.776 21.776,13 21.5,13 Z M21.5,16 L14.5,16 C14.224,16 14,15.776 14,15.5 C14,15.224 14.224,15 14.5,15 L21.5,15 C21.776,15 22,15.224 22,15.5 C22,15.776 21.776,16 21.5,16 Z M21.5,19 L14.5,19 C14.224,19 14,18.776 14,18.5 C14,18.224 14.224,18 14.5,18 L21.5,18 C21.776,18 22,18.224 22,18.5 C22,18.776 21.776,19 21.5,19 Z M21.5,10 L4.5,10 C4.224,10 4,9.776 4,9.5 C4,9.224 4.224,9 4.5,9 L21.5,9 C21.776,9 22,9.224 22,9.5 C22,9.776 21.776,10 21.5,10 Z M21.5,7 L4.5,7 C4.224,7 4,6.776 4,6.5 C4,6.224 4.224,6 4.5,6 L21.5,6 C21.776,6 22,6.224 22,6.5 C22,6.776 21.776,7 21.5,7 Z"
})));
News.displayName = "DecorativeIcon";

const NextGenFirewall = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M23.1996555,11.2001934 L17.7317381,11.2001934 C17.8981356,10.5826027 18.0005341,9.91701278 18.0005341,9.19942363 C18.0005341,5.99467205 15.223776,2.68032213 15.1061778,2.54112423 C15.0013794,2.41792609 14.830982,2.36912683 14.6789843,2.41872608 C14.5245866,2.46832533 14.4157882,2.60512326 14.4021884,2.76672082 L14.165392,5.60667791 C13.5510013,4.02830176 12.443018,1.7819357 10.6758447,0.109160974 C10.5454467,-0.0140371645 10.3502497,-0.0348368503 10.195052,0.0563617718 C10.0406543,0.14916037 9.96705545,0.332357602 10.0142547,0.505154991 C10.4326484,2.03953181 9.92545608,4.51229445 9.44946327,6.25306814 C9.3150653,5.26908301 9.06546907,4.32429729 8.60147608,4.05390137 C8.47747795,3.98270245 8.32468026,3.98190246 8.20068214,4.05310138 C8.07668401,4.1251003 7.99988517,4.2570983 7.99988517,4.40029614 C7.99988517,5.17548443 7.62469084,5.91467326 7.19109739,6.77066032 C6.63270583,7.87304367 5.99991539,9.1218248 5.99991539,10.8001994 C5.99991539,10.9401973 6.01671514,11.0673954 6.02631499,11.2001934 L0.799993956,11.2001934 C0.579197292,11.2001934 0.4,11.3793907 0.4,11.6001874 L0.4,23.600006 C0.4,23.8208027 0.579197292,24 0.799993956,24 L23.1996555,24 C23.4204522,24 23.5996495,23.8208027 23.5996495,23.600006 L23.5996495,11.6001874 C23.5996495,11.3793907 23.4204522,11.2001934 23.1996555,11.2001934 L23.1996555,11.2001934 Z M19.5997099,12.0001813 L19.5997099,15.200133 L15.0597785,15.200133 C15.9701647,14.5233432 16.9077506,13.4345596 17.473342,12.0001813 L19.5997099,12.0001813 Z M8.39987913,19.2000725 L15.5997703,19.2000725 L15.5997703,16.0001209 L8.39987913,16.0001209 L8.39987913,19.2000725 Z M7.90468661,7.13225486 C8.14628296,6.65706204 8.37987943,6.196269 8.54787689,5.72587611 C8.68307485,6.42506555 8.78227335,7.40985067 8.79987308,8.4066356 C8.80307304,8.5986327 8.94387091,8.76183024 9.13346804,8.79382975 C9.32866509,8.82342931 9.50946236,8.71863089 9.57586136,8.53703363 C9.64546031,8.34663651 11.055039,4.45389533 10.9622404,1.58753864 C13.1302077,4.20269912 14.0021945,7.65704693 14.0117943,7.69544635 C14.0581936,7.88504349 14.2197912,8.01064159 14.431788,7.99864177 C14.626985,7.983442 14.7813827,7.82824434 14.7981825,7.63304729 L15.1117777,3.87870402 C15.9101657,5.02188675 17.1997462,7.18105412 17.1997462,9.20022361 C17.1997462,13.0065661 14.163792,15.200133 13.1998066,15.200133 L10.4750478,15.200133 C10.0670539,15.0873347 6.7999033,14.0833498 6.7999033,10.7993995 C6.7999033,9.31302191 7.36149482,8.20423866 7.90468661,7.13225486 L7.90468661,7.13225486 Z M4.39993956,12.0001813 L6.14311323,12.0001813 C6.51430762,13.5905573 7.5806915,14.599342 8.54947687,15.200133 L4.39993956,15.200133 L4.39993956,12.0001813 Z M1.19998791,15.200133 L3.59995165,15.200133 L3.59995165,12.0001813 L1.19998791,12.0001813 L1.19998791,15.200133 Z M1.19998791,19.2000725 L7.59989121,19.2000725 L7.59989121,16.0001209 L1.19998791,16.0001209 L1.19998791,19.2000725 Z M1.19998791,23.2000121 L3.59995165,23.2000121 L3.59995165,20.0000604 L1.19998791,20.0000604 L1.19998791,23.2000121 Z M4.39993956,23.2000121 L11.5998308,23.2000121 L11.5998308,20.0000604 L4.39993956,20.0000604 L4.39993956,23.2000121 Z M12.3998187,23.2000121 L19.5997099,23.2000121 L19.5997099,20.0000604 L12.3998187,20.0000604 L12.3998187,23.2000121 Z M20.3996978,23.2000121 L22.7996616,23.2000121 L22.7996616,20.0000604 L20.3996978,20.0000604 L20.3996978,23.2000121 Z M16.3997583,19.2000725 L22.7996616,19.2000725 L22.7996616,16.0001209 L16.3997583,16.0001209 L16.3997583,19.2000725 Z M20.3996978,15.200133 L22.7996616,15.200133 L22.7996616,12.0001813 L20.3996978,12.0001813 L20.3996978,15.200133 Z"
})));
NextGenFirewall.displayName = "DecorativeIcon";

const NoContract = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "50",
  height: "52",
  viewBox: "0 0 50 52"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M40,30c2.8,0,5,2.2,5,5c0,1.6-0.8,3-2,4l0,0l2,9.8c0.1,0.4-0.1,0.8-0.4,1 C44.4,49.9,44.2,50,44,50c-0.2,0-0.3,0-0.4-0.1l0,0L40,48.1l-3.6,1.8c-0.3,0.2-0.8,0.1-1.1-0.1c-0.3-0.2-0.4-0.6-0.4-1l0,0l2-9.8 c-1.2-0.9-2-2.3-2-4C35,32.2,37.2,30,40,30z M38.8,39.9l-1.5,7.3l2.2-1.1c0.3-0.1,0.6-0.1,0.9,0l0,0l2.2,1.1l-1.5-7.3 C40.8,39.9,40.4,40,40,40S39.2,39.9,38.8,39.9L38.8,39.9z M10.2,44H32c0.6,0,1,0.4,1,1s-0.4,1-1,1l0,0H8.2L10.2,44z M40,2 c0.6,0,1,0.4,1,1l0,0l0,1.8l-2,2L39,4H19v11c0,0.6-0.4,1-1,1l0,0H7l0,22.8l-2,2L5,15c0-0.1,0-0.2,0-0.3l0-0.1c0-0.1,0.1-0.1,0.1-0.2 c0-0.1,0.1-0.1,0.1-0.2l0,0l12-12c0,0,0,0,0.1,0l0.1-0.1l0,0l0.1-0.1l0,0l0.1,0C17.7,2,17.9,2,18,2l0,0H40z M18,38c0.6,0,1,0.4,1,1 s-0.4,1-1,1l0,0h-3.8l2-2H18z M40,32c-1.7,0-3,1.3-3,3s1.3,3,3,3s3-1.3,3-3S41.7,32,40,32z M15.8,30l-2,2H10c-0.5,0-0.9-0.4-1-0.9 L9,31c0-0.6,0.4-1,1-1l0,0H15.8z M32,30c0.6,0,1,0.4,1,1s-0.4,1-1,1l0,0h-9.8l2-2H32z M41,13.2L41,27c0,0.6-0.4,1-1,1s-1-0.4-1-1 l0,0l0-11.8L41,13.2z M23.8,22l-2,2H10c-0.5,0-0.9-0.4-1-0.9L9,23c0-0.6,0.4-1,1-1l0,0H23.8z M36,22c0.6,0,1,0.4,1,1s-0.4,1-1,1l0,0 h-5.8l2-2H36z M31.8,14l-2,2H24c-0.5,0-0.9-0.4-1-0.9l0-0.1c0-0.6,0.4-1,1-1l0,0H31.8z M17,5.4L8.4,14H17V5.4z M3,47.7c0.2,0,0.7,0,0.9-0.2L47.5,3.9c0.4-0.4,0.4-1.1,0-1.5c-0.4-0.4-1.1-0.4-1.5,0L2.3,46 c-0.4,0.4-0.4,1.1,0,1.5C2.3,47.7,2.8,47.7,3,47.7z"
})));
NoContract.displayName = "DecorativeIcon";

const Office = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "19",
  height: "24",
  viewBox: "0 0 19 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M7.51234959,19 L9.51783829,19 C9.79459574,19 10.0192105,18.776 10.0192105,18.5 L10.0192105,16.5 C10.0192105,16.224 9.79459574,16 9.51783829,16 L7.51234959,16 C7.23559215,16 7.01097741,16.224 7.01097741,16.5 L7.01097741,18.5 C7.01097741,18.776 7.23559215,19 7.51234959,19 Z M8.01372176,17 L9.01646612,17 L9.01646612,18 L8.01372176,18 L8.01372176,17 Z M7.51234959,15 L9.51783829,15 C9.79459574,15 10.0192105,14.776 10.0192105,14.5 L10.0192105,12.5 C10.0192105,12.224 9.79459574,12 9.51783829,12 L7.51234959,12 C7.23559215,12 7.01097741,12.224 7.01097741,12.5 L7.01097741,14.5 C7.01097741,14.776 7.23559215,15 7.51234959,15 Z M8.01372176,13 L9.01646612,13 L9.01646612,14 L8.01372176,14 L8.01372176,13 Z M7.51234959,11 L9.51783829,11 C9.79459574,11 10.0192105,10.776 10.0192105,10.5 L10.0192105,8.5 C10.0192105,8.224 9.79459574,8 9.51783829,8 L7.51234959,8 C7.23559215,8 7.01097741,8.224 7.01097741,8.5 L7.01097741,10.5 C7.01097741,10.776 7.23559215,11 7.51234959,11 Z M8.01372176,9 L9.01646612,9 L9.01646612,10 L8.01372176,10 L8.01372176,9 Z M7.51234959,7 L9.51783829,7 C9.79459574,7 10.0192105,6.776 10.0192105,6.5 L10.0192105,4.5 C10.0192105,4.224 9.79459574,4 9.51783829,4 L7.51234959,4 C7.23559215,4 7.01097741,4.224 7.01097741,4.5 L7.01097741,6.5 C7.01097741,6.776 7.23559215,7 7.51234959,7 Z M8.01372176,5 L9.01646612,5 L9.01646612,6 L8.01372176,6 L8.01372176,5 Z M11.523327,7 L13.5288157,7 C13.8055731,7 14.0301879,6.776 14.0301879,6.5 L14.0301879,4.5 C14.0301879,4.224 13.8055731,4 13.5288157,4 L11.523327,4 C11.2465696,4 11.0219548,4.224 11.0219548,4.5 L11.0219548,6.5 C11.0219548,6.776 11.2465696,7 11.523327,7 Z M12.0246992,5 L13.0274435,5 L13.0274435,6 L12.0246992,6 L12.0246992,5 Z M15.5343044,11 L17.5397931,11 C17.8165506,11 18.0411653,10.776 18.0411653,10.5 L18.0411653,8.5 C18.0411653,8.224 17.8165506,8 17.5397931,8 L15.5343044,8 C15.257547,8 15.0329322,8.224 15.0329322,8.5 L15.0329322,10.5 C15.0329322,10.776 15.257547,11 15.5343044,11 Z M16.0356766,9 L17.0384209,9 L17.0384209,10 L16.0356766,10 L16.0356766,9 Z M15.5343044,7 L17.5397931,7 C17.8165506,7 18.0411653,6.776 18.0411653,6.5 L18.0411653,4.5 C18.0411653,4.224 17.8165506,4 17.5397931,4 L15.5343044,4 C15.257547,4 15.0329322,4.224 15.0329322,4.5 L15.0329322,6.5 C15.0329322,6.776 15.257547,7 15.5343044,7 Z M16.0356766,5 L17.0384209,5 L17.0384209,6 L16.0356766,6 L16.0356766,5 Z M21.4986278,23 L20.046654,23 L20.046654,2.5 C20.046654,2.224 19.8220393,2 19.5452818,2 L18.0411653,2 L18.0411653,0.5 C18.0411653,0.224 17.8165506,0 17.5397931,0 L7.51234959,0 C7.23559215,0 7.01097741,0.224 7.01097741,0.5 L7.01097741,2 L5.50686088,2 C5.23010344,2 5.00548871,2.224 5.00548871,2.5 L5.00548871,23 L3.50137218,23 C3.22461474,23 3,23.224 3,23.5 C3,23.776 3.22461474,24 3.50137218,24 L9.51783829,24 C9.79459574,24 10.0192105,23.776 10.0192105,23.5 L10.0192105,21 L15.0329322,21 L15.0329322,23.5 C15.0329322,23.776 15.257547,24 15.5343044,24 L21.4986278,24 C21.7753853,24 22,23.776 22,23.5 C22,23.224 21.7753853,23 21.4986278,23 Z M8.01372176,1 L17.0384209,1 L17.0384209,2 L8.01372176,2 L8.01372176,1 Z M19.0439096,23 L16.0356766,23 L16.0356766,20.5 C16.0356766,20.224 15.8110619,20 15.5343044,20 L9.51783829,20 C9.24108085,20 9.01646612,20.224 9.01646612,20.5 L9.01646612,23 L6.00823306,23 L6.00823306,3 L19.0439096,3 L19.0439096,23 Z M15.5343044,15 L17.5397931,15 C17.8165506,15 18.0411653,14.776 18.0411653,14.5 L18.0411653,12.5 C18.0411653,12.224 17.8165506,12 17.5397931,12 L15.5343044,12 C15.257547,12 15.0329322,12.224 15.0329322,12.5 L15.0329322,14.5 C15.0329322,14.776 15.257547,15 15.5343044,15 Z M16.0356766,13 L17.0384209,13 L17.0384209,14 L16.0356766,14 L16.0356766,13 Z M11.523327,19 L13.5288157,19 C13.8055731,19 14.0301879,18.776 14.0301879,18.5 L14.0301879,16.5 C14.0301879,16.224 13.8055731,16 13.5288157,16 L11.523327,16 C11.2465696,16 11.0219548,16.224 11.0219548,16.5 L11.0219548,18.5 C11.0219548,18.776 11.2465696,19 11.523327,19 Z M12.0246992,17 L13.0274435,17 L13.0274435,18 L12.0246992,18 L12.0246992,17 Z M11.523327,15 L13.5288157,15 C13.8055731,15 14.0301879,14.776 14.0301879,14.5 L14.0301879,12.5 C14.0301879,12.224 13.8055731,12 13.5288157,12 L11.523327,12 C11.2465696,12 11.0219548,12.224 11.0219548,12.5 L11.0219548,14.5 C11.0219548,14.776 11.2465696,15 11.523327,15 Z M12.0246992,13 L13.0274435,13 L13.0274435,14 L12.0246992,14 L12.0246992,13 Z M15.5343044,19 L17.5397931,19 C17.8165506,19 18.0411653,18.776 18.0411653,18.5 L18.0411653,16.5 C18.0411653,16.224 17.8165506,16 17.5397931,16 L15.5343044,16 C15.257547,16 15.0329322,16.224 15.0329322,16.5 L15.0329322,18.5 C15.0329322,18.776 15.257547,19 15.5343044,19 Z M16.0356766,17 L17.0384209,17 L17.0384209,18 L16.0356766,18 L16.0356766,17 Z M11.523327,11 L13.5288157,11 C13.8055731,11 14.0301879,10.776 14.0301879,10.5 L14.0301879,8.5 C14.0301879,8.224 13.8055731,8 13.5288157,8 L11.523327,8 C11.2465696,8 11.0219548,8.224 11.0219548,8.5 L11.0219548,10.5 C11.0219548,10.776 11.2465696,11 11.523327,11 Z M12.0246992,9 L13.0274435,9 L13.0274435,10 L12.0246992,10 L12.0246992,9 Z"
})));
Office.displayName = "DecorativeIcon";

const Offices = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M13.12 5.906h.805v-.804h-.804v.804zm1.206-1.709c.202 0 .403.201.403.402v1.71a.43.43 0 0 1-.403.402h-1.708c-.201 0-.403-.2-.403-.403V4.6c0-.2.202-.402.403-.402h1.708zm1.811 1.71h.805v-.805h-.805v.804zm1.206-1.71c.201 0 .402.201.402.402v1.71a.432.432 0 0 1-.402.402h-1.709c-.2 0-.403-.2-.403-.403V4.6c0-.2.202-.402.403-.402h1.709zm1.81 1.71h.805v-.805h-.804v.804zm1.206-1.71c.202 0 .403.201.403.402v1.71a.432.432 0 0 1-.403.402h-1.708c-.201 0-.403-.2-.403-.403V4.6c0-.2.202-.402.403-.402h1.708zM4.164 14.074h.805v-.804h-.805v.804zm1.207-1.709c.2 0 .402.201.402.403v1.709c0 .202-.202.403-.402.403h-1.71c-.2 0-.402-.201-.402-.403v-1.71c0-.2.202-.402.402-.402h1.71zm1.81 1.71h.804v-.805h-.804v.804zm1.207-1.71c.2 0 .402.201.402.403v1.709c0 .202-.202.403-.402.403h-1.71c-.2 0-.402-.201-.402-.403v-1.71c0-.2.201-.402.401-.402h1.71zm1.81 1.71h.804v-.805h-.804v.804zm1.206-1.71c.2 0 .402.201.402.403v1.709c0 .202-.202.403-.402.403h-1.71c-.2 0-.401-.201-.401-.403v-1.71c0-.2.2-.402.4-.402h1.711zm-7.24 5.832h.805v-.804h-.805v.804zm1.207-1.71c.2 0 .402.202.402.403v1.708c0 .201-.202.403-.402.403h-1.71c-.2 0-.402-.202-.402-.403V16.89c0-.2.202-.403.402-.403h1.71zm1.81 1.71h.804v-.804h-.804v.804zm1.207-1.71c.2 0 .402.202.402.403v1.708c0 .201-.202.403-.402.403h-1.71c-.2 0-.402-.202-.402-.403V16.89c0-.2.201-.403.401-.403h1.71zm1.81 1.71h.804v-.804h-.804v.804zm1.206-1.71c.2 0 .402.202.402.403v1.708c0 .201-.202.403-.402.403h-1.71c-.2 0-.401-.202-.401-.403V16.89c0-.2.2-.403.4-.403h1.711zm-7.24 5.831h.805v-.804h-.805v.804zm1.207-1.709c.2 0 .402.201.402.402v1.71c0 .201-.202.401-.402.401h-1.71c-.2 0-.402-.2-.402-.4v-1.71c0-.202.202-.403.402-.403h1.71zm1.81 1.71h.804v-.805h-.804v.804zm1.207-1.71c.2 0 .402.201.402.402v1.71c0 .201-.202.401-.402.401h-1.71c-.2 0-.402-.2-.402-.4v-1.71c0-.202.201-.403.401-.403h1.71zm1.81 1.71h.804v-.805h-.804v.804zm1.206-1.71c.2 0 .402.201.402.402v1.71c0 .201-.202.401-.402.401h-1.71c-.2 0-.401-.2-.401-.4v-1.71c0-.202.2-.403.4-.403h1.711zm4.733-10.706h.805V9.1h-.805v.804zm1.206-1.61c.201 0 .402.202.402.403v1.71c0 .2-.201.401-.402.401h-1.709c-.2 0-.403-.2-.403-.4V8.695c0-.201.202-.402.403-.402h1.709zm1.81 1.61h.805V9.1h-.804v.804zm1.206-1.61c.202 0 .403.202.403.403v1.71c0 .2-.201.401-.403.401h-1.708c-.201 0-.403-.2-.403-.4V8.695c0-.201.202-.402.403-.402h1.708zM16.137 14h.805v-.804h-.805V14zm1.206-1.61c.201 0 .402.202.402.404v1.709c0 .2-.201.4-.402.4h-1.709c-.2 0-.403-.2-.403-.4v-1.71c0-.201.202-.402.403-.402h1.709zm1.81 1.61h.805v-.804h-.804V14zm1.206-1.61c.202 0 .403.202.403.404v1.709c0 .2-.201.4-.403.4h-1.708c-.201 0-.403-.2-.403-.4v-1.71c0-.201.202-.402.403-.402h1.708zm-4.222 5.706h.805v-.804h-.805v.804zm1.206-1.609c.201 0 .402.202.402.403v1.708a.432.432 0 0 1-.402.403h-1.709c-.2 0-.403-.202-.403-.403V16.89c0-.2.202-.403.403-.403h1.709zm1.81 1.609h.805v-.804h-.804v.804zm1.206-1.609c.202 0 .403.202.403.403v1.708a.432.432 0 0 1-.403.403h-1.708c-.201 0-.403-.202-.403-.403V16.89c0-.2.202-.403.403-.403h1.708zm-4.222 5.705h.805v-.804h-.805v.804zm1.206-1.607c.201 0 .402.201.402.401v1.71c0 .2-.201.402-.402.402h-1.709c-.2 0-.403-.202-.403-.403v-1.709c0-.2.202-.401.403-.401h1.709zm1.81 1.607h.805v-.804h-.804v.804zm1.206-1.607c.202 0 .403.201.403.401v1.71c0 .2-.201.402-.403.402h-1.708c-.201 0-.403-.202-.403-.403v-1.709c0-.2.202-.401.403-.401h1.708zM13.095 1.649h6.737v-.644h-6.737v.644zm-8.928 8.617h6.737v-.643H4.167v.643zm18.18-8.617c.36 0 .653.292.653.653v21.195a.503.503 0 0 1-1.006 0V2.654H10.933v5.964h.323c.361 0 .654.293.654.653v.995h1.508c.36 0 .654.293.654.654v12.577a.503.503 0 0 1-1.006 0V11.272H2.006v12.225a.503.503 0 0 1-1.006 0V10.92c0-.361.294-.654.654-.654h1.508v-.995c0-.36.292-.653.653-.653h6.112V2.302c0-.36.294-.653.654-.653h1.508V.653c0-.36.294-.653.654-.653h7.44c.361 0 .655.293.655.653v.996h1.508z",
  fillRule: "evenodd"
})));
Offices.displayName = "DecorativeIcon";

const OnDemand = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M12,23.5 C5.659,23.5 0.5,18.341 0.5,12 C0.5,5.659 5.659,0.5 12,0.5 C18.341,0.5 23.5,5.659 23.5,12 C23.5,18.341 18.341,23.5 12,23.5 Z M12,1.5 C6.21,1.5 1.5,6.21 1.5,12 C1.5,17.79 6.21,22.5 12,22.5 C17.79,22.5 22.5,17.79 22.5,12 C22.5,6.21 17.79,1.5 12,1.5 Z M8,18.5 C7.915,18.5 7.83,18.479 7.753,18.435 C7.597,18.346 7.5,18.18 7.5,18 L7.5,6 C7.5,5.82 7.597,5.654 7.753,5.565 C7.91,5.476 8.102,5.478 8.257,5.571 L18.257,11.571 C18.407,11.661 18.5,11.824 18.5,12 C18.5,12.176 18.408,12.338 18.257,12.429 L8.257,18.429 C8.178,18.476 8.089,18.5 8,18.5 Z M8.5,6.883 L8.5,17.116 L17.028,12 L8.5,6.883 Z"
})));
OnDemand.displayName = "DecorativeIcon";

const OnTheGo = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "14",
  height: "24",
  viewBox: "0 0 14 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "rotate(90 9.5 9.5)",
  d: "M4.62467904,5.00667929 L18.4181126,5.00667929 C18.4447593,5.00228554 18.4721142,5 18.5,5 C18.5278858,5 18.5552407,5.00228554 18.5818874,5.00667929 L20.5,5.00667929 C22.43,5.00667929 24,6.57593026 24,8.50500947 L24,15.5016698 C24,17.430749 22.43,19 20.5,19 L3.5,19 C1.57,19 2.31886714e-14,17.430749 2.33068499e-14,15.5016698 L2.37354762e-14,8.50500947 C2.38536547e-14,6.57593026 1.57,5.00667929 3.5,5.00667929 L4.46090414,5.00667929 C4.48755087,5.00228554 4.51490582,5 4.54279159,5 C4.57067736,5 4.59803231,5.00228554 4.62467904,5.00667929 Z M5.04279159,6.0062022 L5.04279159,18.0004771 L18,18.0004771 L18,6.0062022 L5.04279159,6.0062022 Z M4.04279159,6.0062022 L3.5,6.0062022 C2.122,6.0062022 1,7.1276669 1,8.50500947 L1,15.5016698 C1,16.8790124 2.122,18.0004771 3.5,18.0004771 L4.04279159,18.0004771 L4.04279159,6.0062022 Z M19,6.0062022 L19,18.0004771 L20.5,18.0004771 C21.878,18.0004771 23,16.8790124 23,15.5016698 L23,8.50500947 C23,7.1276669 21.878,6.0062022 20.5,6.0062022 L19,6.0062022 Z M2.005,10.5689213 C2.005,10.2930529 2.229,10.0691598 2.505,10.0691598 C2.781,10.0691598 3.005,10.2930529 3.005,10.5689213 L3.005,13.56749 C3.005,13.8433583 2.781,14.0672514 2.505,14.0672514 C2.229,14.0672514 2.005,13.8433583 2.005,13.56749 L2.005,10.5689213 Z M21,13.0091987 C20.4477153,13.0091987 20,12.5616971 20,12.0096758 C20,11.4576545 20.4477153,11.0101529 21,11.0101529 C21.5522847,11.0101529 22,11.4576545 22,12.0096758 C22,12.5616971 21.5522847,13.0091987 21,13.0091987 Z M14.4997808,14.0165208 L8.49978078,14.0165208 C8.29778078,14.0165208 8.11478078,13.894579 8.03778078,13.7076682 C7.96078078,13.5207575 8.00378078,13.30586 8.14578078,13.1629283 L11.1457808,9.16483658 C11.3407808,8.96992961 11.6577808,8.96992961 11.8527808,9.16483658 L14.8527808,13.1629283 C14.9957808,13.30586 15.0387808,13.5207575 14.9607808,13.7076682 C14.8827808,13.894579 14.7017808,14.0165208 14.4997808,14.0165208 Z M9.70678078,13.0169979 L13.2927808,13.0169979 L11.4997808,10.2253304 L9.70678078,13.0169979 Z M2.505,8.3734526 C2.229,8.3734526 2,8.14955947 2,7.87369114 C2,7.59782282 2.219,7.37392969 2.495,7.37392969 L2.505,7.37392969 C2.781,7.37392969 3.005,7.59782282 3.005,7.87369114 C3.005,8.14955947 2.781,8.3734526 2.505,8.3734526 Z"
})));
OnTheGo.displayName = "DecorativeIcon";

const Paperless = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 20.87 23.95"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-2.23 -0.04)",
  d: "M23.06,1.31a1.1,1.1,0,0,0-.89-1C21.71.27,11-1.44,4.89,4.12a8.36,8.36,0,0,0-2.66,6.26,10,10,0,0,0,2.49,6.46,29.65,29.65,0,0,0-2.45,6.54.5.5,0,0,0,.38.6h.11a.49.49,0,0,0,.48-.39,29.62,29.62,0,0,1,2.22-6,9.81,9.81,0,0,0,6.69,2.73,8.28,8.28,0,0,0,5.64-2.14C23.84,12.64,23.09,1.77,23.06,1.31ZM17.11,17.45c-3,2.8-8,2.42-11.17-.77a20.12,20.12,0,0,1,1.51-2.33A20.6,20.6,0,0,1,13.82,8.8a.5.5,0,0,0-.44-.9,21.34,21.34,0,0,0-6.72,5.84A20.57,20.57,0,0,0,5.24,15.9a8.88,8.88,0,0,1-2-5.52A7.39,7.39,0,0,1,5.57,4.86C9,1.68,14.21,1,17.82,1a27.42,27.42,0,0,1,4.19.3l0,0,0,0C22.09,1.83,22.81,12.23,17.11,17.45Z"
})));
Paperless.displayName = "DecorativeIcon";

const Passport = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M16.3629,16.6611 C16.6369,16.6611 16.8589,16.8831 16.8589,17.1571 C16.8589,17.4311 16.6369,17.6521 16.3629,17.6521 L7.6359,17.6521 C7.3619,17.6521 7.1399,17.4311 7.1399,17.1571 C7.1399,16.8831 7.3619,16.6611 7.6359,16.6611 L16.3629,16.6611 Z M19.8345,21.918 L19.8345,2.083 C19.8345,1.481 19.3445,0.992 18.7425,0.992 L5.2555,0.992 C4.6545,0.992 4.1655,1.481 4.1655,2.083 L4.1655,21.918 C4.1655,22.519 4.6545,23.008 5.2555,23.008 L18.7425,23.008 C19.3445,23.008 19.8345,22.519 19.8345,21.918 Z M18.7425,0 C19.8925,0 20.8265,0.934 20.8265,2.083 L20.8265,21.918 C20.8265,23.066 19.8925,24 18.7425,24 L5.2555,24 C4.1075,24 3.1735,23.066 3.1735,21.918 L3.1735,2.083 C3.1735,0.934 4.1075,0 5.2555,0 L18.7425,0 Z M15.857,12.6836 C16.269,12.2716 16.577,11.7996 16.83,11.3066 L14.63,11.3066 C14.337,12.3336 13.855,13.2876 13.225,14.1246 C14.189,13.9046 15.107,13.4336 15.857,12.6836 Z M7.17,11.3066 C7.422,11.7996 7.73,12.2716 8.143,12.6836 C8.892,13.4336 9.811,13.9046 10.774,14.1246 C10.145,13.2876 9.662,12.3336 9.369,11.3066 L7.17,11.3066 Z M6.779,7.3386 C6.503,8.3136 6.503,9.3396 6.779,10.3136 L9.147,10.3136 C9.066,9.8276 9.024,9.3296 9.024,8.8266 C9.024,8.3236 9.066,7.8266 9.147,7.3386 L6.779,7.3386 Z M8.143,4.9696 C7.73,5.3816 7.422,5.8536 7.17,6.3476 L9.369,6.3476 C9.663,5.3166 10.147,4.3616 10.779,3.5216 C9.79,3.7466 8.878,4.2346 8.143,4.9696 Z M13.594,6.3476 C13.259,5.3146 12.718,4.3686 12,3.5836 C11.281,4.3686 10.74,5.3156 10.406,6.3476 L13.594,6.3476 Z M10.154,10.3136 L13.845,10.3136 C13.937,9.8296 13.983,9.3306 13.983,8.8266 C13.983,8.3226 13.937,7.8246 13.845,7.3386 L10.154,7.3386 C10.063,7.8246 10.016,8.3226 10.016,8.8266 C10.016,9.3306 10.063,9.8296 10.154,10.3136 Z M10.406,11.3066 C10.74,12.3386 11.281,13.2846 12,14.0696 C12.718,13.2846 13.259,12.3376 13.594,11.3066 L10.406,11.3066 Z M14.853,7.3386 C14.933,7.8266 14.975,8.3236 14.975,8.8266 C14.975,9.3296 14.933,9.8276 14.853,10.3136 L17.22,10.3136 C17.497,9.3396 17.497,8.3136 17.22,7.3386 L14.853,7.3386 Z M16.83,6.3476 C16.577,5.8536 16.269,5.3816 15.857,4.9696 C15.122,4.2346 14.21,3.7476 13.22,3.5216 C13.853,4.3616 14.337,5.3166 14.63,6.3476 L16.83,6.3476 Z M12.018,2.3846 C13.663,2.3886 15.306,3.0166 16.558,4.2676 C19.071,6.7816 19.071,10.8716 16.558,13.3846 C15.306,14.6366 13.662,15.2646 12.017,15.2696 C12.011,15.2696 12.005,15.2726 12,15.2726 C11.994,15.2726 11.988,15.2696 11.982,15.2696 C10.337,15.2646 8.694,14.6366 7.441,13.3846 C4.928,10.8716 4.928,6.7816 7.441,4.2676 C8.693,3.0166 10.336,2.3896 11.981,2.3846 C11.987,2.3836 11.993,2.3796 12,2.3796 C12.006,2.3796 12.012,2.3836 12.018,2.3846 Z M14.7769,19.835 C15.0499,19.835 15.2719,20.057 15.2719,20.331 C15.2719,20.606 15.0499,20.827 14.7769,20.827 L9.2229,20.827 C8.9479,20.827 8.7269,20.606 8.7269,20.331 C8.7269,20.057 8.9479,19.835 9.2229,19.835 L14.7769,19.835 Z"
})));
Passport.displayName = "DecorativeIcon";

const Phone = props => {
  return /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "24",
    viewBox: "0 0 16 24"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    transform: "translate(-4)",
    d: "M12.508704,1.509408 C12.773664,1.509408 12.988704,1.724448 12.988704,1.989408 C12.988704,2.254368 12.773664,2.469408 12.508704,2.469408 L11.475744,2.469408 C11.209824,2.469408 10.995744,2.254368 10.995744,1.989408 C10.995744,1.724448 11.209824,1.509408 11.475744,1.509408 L12.508704,1.509408 Z M18.68592,3.0192 L18.68592,2.46624 C18.68592,1.62144 18.02544,0.96 17.18064,0.96 L6.82032,0.96 C5.97552,0.96 5.31408,1.62144 5.31408,2.46624 L5.31408,3.0192 L18.68592,3.0192 Z M5.31408,20.25888 L18.68592,20.25888 L18.68592,3.9792 L5.31408,3.9792 L5.31408,20.25888 Z M18.68592,21.53376 L18.68592,21.21888 L5.31408,21.21888 L5.31408,21.53376 C5.31408,22.37856 5.97552,23.04 6.82032,23.04 L17.10096,23.04 C17.97456,23.04 18.68592,22.36416 18.68592,21.53376 Z M17.18064,0 C18.56304,0 19.64592,1.08288 19.64592,2.46624 L19.64592,21.53376 C19.64592,22.89408 18.50448,24 17.10096,24 L6.82032,24 C5.43696,24 4.35408,22.91616 4.35408,21.53376 L4.35408,2.46624 C4.35408,1.08288 5.43696,0 6.82032,0 L17.18064,0 Z"
  })));
};
Phone.displayName = "DecorativeIcon";

const PhoneBusiness = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M16.5,13 L15.5,13 C15.224,13 15,13.224 15,13.5 C15,13.776 15.224,14 15.5,14 L16.5,14 C16.776,14 17,13.776 17,13.5 C17,13.224 16.776,13 16.5,13 Z M16.5,16 L15.5,16 C15.224,16 15,16.224 15,16.5 C15,16.776 15.224,17 15.5,17 L16.5,17 C16.776,17 17,16.776 17,16.5 C17,16.224 16.776,16 16.5,16 Z M16.5,19 L15.5,19 C15.224,19 15,19.224 15,19.5 C15,19.776 15.224,20 15.5,20 L16.5,20 C16.776,20 17,19.776 17,19.5 C17,19.224 16.776,19 16.5,19 Z M11.5,17 L12.5,17 C12.776,17 13,16.776 13,16.5 C13,16.224 12.776,16 12.5,16 L11.5,16 C11.224,16 11,16.224 11,16.5 C11,16.776 11.224,17 11.5,17 Z M23.5,4 L8.908,4 C8.757,3.576 8.424,3.243 8,3.092 L8,0.5 C8,0.224 7.776,0 7.5,0 C7.224,0 7,0.224 7,0.5 L7,3 L4.5,3 C3.849,3 3.299,3.419 3.092,4 L0.5,4 C0.224,4 0,4.224 0,4.5 L0,22.5 C0,22.776 0.224,23 0.5,23 L3.092,23 C3.299,23.581 3.849,24 4.5,24 L7.5,24 C8.151,24 8.701,23.581 8.908,23 L23.5,23 C23.776,23 24,22.776 24,22.5 L24,4.5 C24,4.224 23.776,4 23.5,4 Z M3.158,19.066 C3.055,19.273 3,19.505 3,19.736 L3,22 L1,22 L1,5 L3,5 L3,7.264 C3,7.496 3.055,7.728 3.158,7.935 L3.947,9.513 C3.981,9.582 4,9.659 4,9.736 L4,17.264 C4,17.341 3.981,17.418 3.947,17.488 L3.158,19.066 Z M8,22.5 C8,22.776 7.775,23 7.5,23 L4.5,23 C4.225,23 4,22.776 4,22.5 L4,19.736 C4,19.659 4.019,19.582 4.053,19.512 L4.842,17.934 C4.945,17.727 5,17.495 5,17.264 L5,9.736 C5,9.504 4.945,9.272 4.842,9.065 L4.053,7.487 C4.019,7.418 4,7.341 4,7.264 L4,4.5 C4,4.224 4.225,4 4.5,4 L7.5,4 C7.775,4 8,4.224 8,4.5 L8,7.264 C8,7.341 7.981,7.418 7.947,7.488 L7.158,9.066 C7.055,9.273 7,9.505 7,9.736 L7,17.264 C7,17.496 7.055,17.728 7.158,17.935 L7.947,19.513 C7.981,19.582 8,19.659 8,19.736 L8,22.5 Z M23,22 L9,22 L9,19.736 C9,19.504 8.945,19.272 8.842,19.065 L8.053,17.487 C8.019,17.418 8,17.341 8,17.264 L8,9.736 C8,9.659 8.019,9.582 8.053,9.513 L8.842,7.934 C8.945,7.727 9,7.495 9,7.264 L9,5 L23,5 L23,22 Z M11.5,11 L20.5,11 C20.776,11 21,10.776 21,10.5 L21,7.5 C21,7.224 20.776,7 20.5,7 L11.5,7 C11.224,7 11,7.224 11,7.5 L11,10.5 C11,10.776 11.224,11 11.5,11 Z M12,8 L20,8 L20,10 L12,10 L12,8 Z M11.5,14 L12.5,14 C12.776,14 13,13.776 13,13.5 C13,13.224 12.776,13 12.5,13 L11.5,13 C11.224,13 11,13.224 11,13.5 C11,13.776 11.224,14 11.5,14 Z M11.5,20 L12.5,20 C12.776,20 13,19.776 13,19.5 C13,19.224 12.776,19 12.5,19 L11.5,19 C11.224,19 11,19.224 11,19.5 C11,19.776 11.224,20 11.5,20 Z M20.5,16 L19.5,16 C19.224,16 19,16.224 19,16.5 C19,16.776 19.224,17 19.5,17 L20.5,17 C20.776,17 21,16.776 21,16.5 C21,16.224 20.776,16 20.5,16 Z M20.5,13 L19.5,13 C19.224,13 19,13.224 19,13.5 C19,13.776 19.224,14 19.5,14 L20.5,14 C20.776,14 21,13.776 21,13.5 C21,13.224 20.776,13 20.5,13 Z M20.5,19 L19.5,19 C19.224,19 19,19.224 19,19.5 C19,19.776 19.224,20 19.5,20 L20.5,20 C20.776,20 21,19.776 21,19.5 C21,19.224 20.776,19 20.5,19 Z"
})));
PhoneBusiness.displayName = "DecorativeIcon";

const PhoneHome = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M7,15.3430449 L7,4.26190476 C7,3.01514286 8.02,2 9.27272727,2 L14,2 L14,1.5 C14,0.673 14.673,5.32907052e-15 15.5,5.32907052e-15 C16.327,5.32907052e-15 17,0.673 17,1.5 L17,2.31421586 C17.041299,2.4874104 17,2.75511064 17,3.16845703 L17,15.3437378 C17.2554035,15.1548534 17.5558722,15.0373547 17.874,15.0091872 C18.372,14.964233 19.829,15.1320619 20.181,15.4837033 L21.268,17.5675589 C21.74,18.0390781 22,18.6654394 22,19.332759 L22,21.5025465 C22,22.8801419 20.879,24 19.5,24 L4.5,24 C3.121,24 2,22.8801419 2,21.5025465 L2,19.332759 C2,18.6074985 2.308,17.991127 3.029,17.2698624 L3.822,15.4807064 C4.174,15.1290649 5.641,14.962235 6.125,15.0071892 C6.4434471,15.035998 6.74419972,15.1535652 7,15.3430449 Z M7,16.8465382 C6.86010586,16.6999309 6.72687854,16.5348043 6.599,16.3488212 C6.461,16.1490249 6.255,16.0221543 6.034,16.0011757 C5.845,15.9991777 4.68,16.03614 4.53,16.1869862 L3.736,17.9761422 C3.089,18.6234822 3,19.011087 3,19.332759 L3,21.5025465 C3,22.3287041 3.673,23.0010186 4.5,23.0010186 L19.5,23.0010186 C20.327,23.0010186 21,22.3287041 21,21.5025465 L21,19.332759 C21,18.9381613 20.84,18.5525545 20.561,18.2728397 L19.474,16.1889842 C19.297,16.0121645 18.096,15.9891879 17.966,16.0021747 C17.744,16.0231533 17.538,16.1480259 17.402,16.3478222 C17.2737952,16.5342273 17.1402372,16.6996938 17,16.8465719 L17,18.7380952 C17,19.9848571 15.98,21 14.7272727,21 L9.27272727,21 C8.02,21 7,19.9848571 7,18.7380952 L7,16.8465382 Z M14.5833334,3 L9.33333333,3 C8.59822222,3 8,3.60215789 8,4.34210526 L8,18.6578947 C8,19.3978421 8.59822222,20 9.33333333,20 L14.6666667,20 C15.4017778,20 16,19.3978421 16,18.6578947 L16,4.34210526 C16,3.45304247 16,3.11469712 15.8395948,3 L14.5833334,3 Z M14,15 L10,15 C9.724,15 9.5,14.776 9.5,14.5 C9.5,14.224 9.724,14 10,14 L14,14 C14.276,14 14.5,14.224 14.5,14.5 C14.5,14.776 14.276,15 14,15 Z M14,13 L10,13 C9.724,13 9.5,12.776 9.5,12.5 C9.5,12.224 9.724,12 10,12 L14,12 C14.276,12 14.5,12.224 14.5,12.5 C14.5,12.776 14.276,13 14,13 Z M14,17 L10,17 C9.724,17 9.5,16.776 9.5,16.5 C9.5,16.224 9.724,16 10,16 L14,16 C14.276,16 14.5,16.224 14.5,16.5 C14.5,16.776 14.276,17 14,17 Z M15,2 L16,2 L16,1.5 C16,1.224 15.776,1 15.5,1 C15.224,1 15,1.224 15,1.5 L15,2 Z M14.5,10 L9.5,10 C9.224,10 9,9.776 9,9.5 L9,5.5 C9,5.224 9.224,5 9.5,5 L14.5,5 C14.776,5 15,5.224 15,5.5 L15,9.5 C15,9.776 14.776,10 14.5,10 Z M10,9 L14,9 L14,6 L10,6 L10,9 Z"
})));
PhoneHome.displayName = "DecorativeIcon";

const PhoneReception = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20",
  height: "24",
  viewBox: "0 0 20 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-4)",
  d: "M13.1343199,2 L11.1343199,2 C10.8583199,2 10.6343199,2.224 10.6343199,2.5 C10.6343199,2.776 10.8583199,3 11.1343199,3 L13.1343199,3 C13.4103199,3 13.6343199,2.776 13.6343199,2.5 C13.6343199,2.224 13.4103199,2 13.1343199,2 Z M16.1393199,2 L16.1293199,2 C15.8533199,2 15.6343199,2.224 15.6343199,2.5 C15.6343199,2.776 15.8633199,3 16.1393199,3 C16.4153199,3 16.6393199,2.776 16.6393199,2.5 C16.6393199,2.224 16.4153199,2 16.1393199,2 Z M12.6343199,22 C13.1863199,22 13.6343199,21.552 13.6343199,21 C13.6343199,20.448 13.1863199,20 12.6343199,20 C12.0823199,20 11.6343199,20.448 11.6343199,21 C11.6343199,21.552 12.0813199,22 12.6343199,22 Z M19.1343199,16.5 C18.8583199,16.5 18.6343199,16.724 18.6343199,17 L18.6343199,18 L5.6343199,18 L5.6343199,5 L18.6343199,5 L18.6343199,6 C18.6343199,6.276 18.8583199,6.5 19.1343199,6.5 C19.4103199,6.5 19.6343199,6.276 19.6343199,6 L19.6343199,3.5 C19.6343199,1.57 18.0643199,0 16.1343199,0 L8.1343199,0 C6.2043199,0 4.6343199,1.57 4.6343199,3.5 L4.6343199,20.5 C4.6343199,22.43 6.2043199,24 8.1343199,24 L16.1343199,24 C18.0643199,24 19.6343199,22.43 19.6343199,20.5 L19.6343199,17 C19.6343199,16.724 19.4103199,16.5 19.1343199,16.5 Z M5.6343199,3.5 C5.6343199,2.122 6.7553199,1 8.1343199,1 L16.1343199,1 C17.5133199,1 18.6343199,2.122 18.6343199,3.5 L18.6343199,4 L5.6343199,4 L5.6343199,3.5 Z M18.7493199,20.5 C18.7493199,21.878 17.6283199,23 16.2493199,23 L8.2493199,23 C6.8703199,23 5.7493199,21.878 5.7493199,20.5 L5.7493199,19 L18.7493199,19 L18.7493199,20.5 Z M11.3343199,16 L8.9343199,16 C8.7687199,16 8.6343199,15.9004444 8.6343199,15.7777778 L8.6343199,12.2222222 C8.6343199,12.0995556 8.7687199,12 8.9343199,12 L11.3343199,12 C11.4999199,12 11.6343199,12.0995556 11.6343199,12.2222222 L11.6343199,15.7777778 C11.6343199,15.9004444 11.4999199,16 11.3343199,16 Z M9.67704451,15.0494385 L10.6797301,15.0083008 L10.658856,12.9541016 L9.65617049,12.9952393 L9.67704451,15.0494385 Z M15.3343199,16 L12.9343199,16 C12.7687199,16 12.6343199,15.904 12.6343199,15.7857143 L12.6343199,10.2142857 C12.6343199,10.096 12.7687199,10 12.9343199,10 L15.3343199,10 C15.4999199,10 15.6343199,10.096 15.6343199,10.2142857 L15.6343199,15.7857143 C15.6343199,15.904 15.4999199,16 15.3343199,16 Z M13.6582457,14.979248 L14.6337095,14.9908447 L14.6278502,10.9630127 L13.6268736,10.9616699 L13.6582457,14.979248 Z M19.3343199,16 L16.9343199,16 C16.7687199,16 16.6343199,15.9056842 16.6343199,15.7894737 L16.6343199,8.21052632 C16.6343199,8.09431579 16.7687199,8 16.9343199,8 L19.3343199,8 C19.4999199,8 19.6343199,8.09431579 19.6343199,8.21052632 L19.6343199,15.7894737 C19.6343199,15.9056842 19.4999199,16 19.3343199,16 Z M17.6191832,14.9798584 L18.67265,15.0361328 L18.5889342,9.00305176 L17.6851011,8.94055176 L17.6191832,14.9798584 Z M23.3343199,16 L20.9343199,16 C20.7687199,16 20.6343199,15.9066667 20.6343199,15.7916667 L20.6343199,6.20833333 C20.6343199,6.09333333 20.7687199,6 20.9343199,6 L23.3343199,6 C23.4999199,6 23.6343199,6.09333333 23.6343199,6.20833333 L23.6343199,15.7916667 C23.6343199,15.9066667 23.4999199,16 23.3343199,16 Z M21.6091734,14.9622803 L22.5931822,15.0394287 L22.6189146,7.0456543 L21.6349058,6.96850586 L21.6091734,14.9622803 Z"
})));
PhoneReception.displayName = "DecorativeIcon";

const Photo = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M6.05184,6.846048 C5.61984,7.279008 5.61984,7.981728 6.05184,8.414688 C6.48384,8.846688 7.18848,8.846688 7.62048,8.414688 C8.05248,7.981728 8.05248,7.279008 7.62048,6.846048 C7.40448,6.630048 7.12032,6.521568 6.83616,6.521568 C6.552,6.521568 6.26784,6.630048 6.05184,6.846048 Z M6.83616,9.698208 C6.30624,9.698208 5.77632,9.496608 5.37312,9.093408 C4.56672,8.286048 4.56672,6.973728 5.37312,6.167328 C6.17952,5.359968 7.4928,5.359968 8.2992,6.167328 C9.1056,6.973728 9.1056,8.286048 8.2992,9.093408 C7.896,9.496608 7.36608,9.698208 6.83616,9.698208 Z M21.9312,20.6568 C22.54272,20.6568 23.04,20.15856 23.04,19.548 L23.04,18.25104 L17.58528,10.84464 C17.31264,10.47696 16.89504,10.25232 16.43616,10.22832 C15.96384,10.21488 15.53088,10.3896 15.22176,10.73232 L11.18592,15.23856 C11.0976,15.33648 10.9728,15.39504 10.84128,15.39792 C10.71936,15.40176 10.58208,15.35088 10.48896,15.25776 L8.45472,13.22352 C7.89024,12.66384 7.00128,12.6264 6.3888,13.14096 L0.96,17.75568 L0.96,19.548 C0.96,20.15856 1.45728,20.6568 2.06976,20.6568 L21.9312,20.6568 Z M2.06976,3.3432 C1.45728,3.3432 0.96,3.84048 0.96,4.452 L0.96,16.4952 L5.7696,12.40752 C6.76512,11.57136 8.20896,11.62992 9.13152,12.54288 L10.8096,14.22 L14.50848,10.09008 C15.0144,9.5304 15.72672,9.22896 16.48512,9.27024 C17.232,9.30768 17.91456,9.6744 18.35712,10.27632 L23.04,16.63344 L23.04,4.452 C23.04,3.84048 22.54272,3.3432 21.9312,3.3432 L2.06976,3.3432 Z M21.9312,2.3832 C23.07168,2.3832 24,3.31152 24,4.452 L24,19.548 C24,20.68848 23.07168,21.6168 21.9312,21.6168 L2.06976,21.6168 C0.92832,21.6168 4.54747351e-13,20.68848 4.54747351e-13,19.548 L4.54747351e-13,4.452 C4.54747351e-13,3.31152 0.92832,2.3832 2.06976,2.3832 L21.9312,2.3832 Z"
})));
Photo.displayName = "DecorativeIcon";

const Photos = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M23.9229,16.83385 C24.2369,17.98185 23.5709,19.17485 22.4329,19.51185 C22.4119,19.52085 22.3929,19.52685 22.3719,19.53285 L7.4589,23.52985 C7.2679,23.58185 7.0719,23.60785 6.8789,23.60785 C6.5019,23.60785 6.1299,23.51085 5.7929,23.31785 C5.2989,23.03585 4.9409,22.58385 4.7809,22.03985 C4.7729,22.02085 4.7659,21.99885 4.7599,21.97885 L4.0379,19.26585 C3.9669,18.99785 4.1259,18.72485 4.3929,18.65285 C4.6579,18.57985 4.9339,18.74085 5.0049,19.00785 L5.7159,21.68085 C5.7229,21.69785 5.7289,21.71585 5.7339,21.73385 C5.8169,22.03885 6.0139,22.29285 6.2889,22.44985 C6.5659,22.60785 6.8889,22.64985 7.1969,22.56385 L22.0789,18.57585 C22.0949,18.56985 22.1109,18.56485 22.1259,18.56085 L22.1249,18.55985 C22.4299,18.47685 22.6849,18.27685 22.8429,17.99885 C22.9999,17.72185 23.0409,17.39985 22.9569,17.09585 L22.0279,13.60985 C21.9569,13.34385 22.1159,13.06885 22.3829,12.99785 C22.6529,12.92285 22.9249,13.08685 22.9949,13.35285 L23.9229,16.83385 Z M4.4907,4.88365 C4.0667,5.30765 4.0667,5.99665 4.4907,6.42065 C4.9147,6.84365 5.6037,6.84265 6.0277,6.42065 C6.4507,5.99665 6.4507,5.30765 6.0277,4.88365 C5.8157,4.67165 5.5367,4.56565 5.2597,4.56565 C4.9807,4.56565 4.7027,4.67165 4.4907,4.88365 Z M5.2587,7.73765 C4.7247,7.73765 4.1907,7.53365 3.7837,7.12765 C2.9697,6.31365 2.9697,4.98965 3.7837,4.17665 C4.5977,3.36265 5.9217,3.36365 6.7347,4.17665 C7.5477,4.98965 7.5477,6.31365 6.7347,7.12765 C6.3277,7.53365 5.7937,7.73765 5.2587,7.73765 Z M1,15.36115 C1,15.85515 1.402,16.25715 1.896,16.25715 L18.935,16.25715 C19.412,16.25715 19.796,15.87915 19.82,15.40715 C19.82,15.40615 19.818,15.40515 19.817,15.40415 L15.065,8.95415 C14.849,8.66015 14.515,8.48215 14.149,8.46315 C13.786,8.44215 13.429,8.59115 13.182,8.86615 L9.725,12.72815 C9.633,12.83015 9.503,12.89015 9.365,12.89415 C9.228,12.90015 9.095,12.84415 8.998,12.74715 L7.261,11.00215 C6.811,10.55715 6.1,10.52815 5.612,10.93715 L1,14.86215 L1,15.36115 Z M1.896,1.39215 C1.402,1.39215 1,1.79415 1,2.28815 L1,13.54915 L4.967,10.17315 C5.856,9.42815 7.145,9.48215 7.967,10.29315 L9.333,11.66615 L12.438,8.19715 C12.888,7.69815 13.532,7.42715 14.198,7.46515 C14.865,7.49815 15.475,7.82415 15.87,8.36115 L19.83,13.73515 L19.83,2.28815 C19.83,1.79415 19.429,1.39215 18.935,1.39215 L1.896,1.39215 Z M20.83,15.36115 C20.83,16.40615 19.979,17.25715 18.935,17.25715 L1.896,17.25715 C0.851,17.25715 -7.46069873e-14,16.40615 -7.46069873e-14,15.36115 L-7.46069873e-14,2.28815 C-7.46069873e-14,1.24315 0.851,0.39215 1.896,0.39215 L18.935,0.39215 C19.979,0.39215 20.83,1.24315 20.83,2.28815 L20.83,15.36115 Z"
})));
Photos.displayName = "DecorativeIcon";

const PikTV = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M22.5,2 L1.5,2 C0.673,2 0,2.673 0,3.5 L0,17.5 C0,18.327 0.673,19 1.5,19 L10,19 L10,20.077 L4.418,21.007 C4.146,21.052 3.962,21.31 4.007,21.582 C4.048,21.827 4.26,22 4.5,22 C4.527,22 4.554,21.998 4.582,21.993 L10.54,21 L13.459,21 L19.417,21.993 C19.445,21.998 19.473,22 19.5,22 C19.741,22 19.953,21.827 19.992,21.582 C20.038,21.31 19.853,21.052 19.581,21.007 L14,20.077 L14,19 L22.5,19 C23.327,19 24,18.327 24,17.5 L24,3.5 C24,2.673 23.327,2 22.5,2 Z M13,20 L11,20 L11,19 L13,19 L13,20 Z M23,17.5 C23,17.776 22.776,18 22.5,18 L1.5,18 C1.224,18 1,17.776 1,17.5 L1,3.5 C1,3.224 1.224,3 1.5,3 L22.5,3 C22.776,3 23,3.224 23,3.5 L23,17.5 Z M10,14.5 C10.097,14.5 10.193,14.472 10.277,14.416 L16.277,10.416 C16.416,10.323 16.5,10.167 16.5,10 C16.5,9.833 16.416,9.677 16.278,9.584 L10.278,5.584 C10.123,5.481 9.927,5.472 9.764,5.559 C9.602,5.646 9.5,5.815 9.5,6 L9.5,14 C9.5,14.185 9.602,14.354 9.764,14.441 C9.838,14.48 9.919,14.5 10,14.5 Z M10.5,6.934 L15.099,10 L10.5,13.066 L10.5,6.934 Z"
})));
PikTV.displayName = "DecorativeIcon";

const PiggyBank = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M24,12.1220534 L23.8752203,14.7164062 L23.393718,14.6884875 C22.9889858,14.66502 22.6181359,14.5320342 22.2601545,14.3062667 C21.8901368,16.0084654 21.0085155,17.3543306 19.6025671,18.3053302 L19.6025671,21.4151367 C19.6005228,21.4820279 19.6005228,21.4820279 19.5971128,21.5173465 C19.5960721,21.528707 19.5960721,21.528707 19.5958583,21.5314906 L19.5628853,22 L13.8152666,22 L13.7813762,21.5326179 C13.7779639,21.4866822 13.7762759,21.4548068 13.7762759,21.4151367 L13.7762759,19.9782315 C13.7002051,19.9815556 13.5997719,19.9825589 13.4527747,19.9825589 C12.8269631,19.9825589 12.2498872,19.9714328 11.7093551,19.9480351 L11.7093551,21.4151367 C11.7086901,21.4614448 11.7086901,21.4614448 11.7073087,21.4922679 C11.7067852,21.5042159 11.7067852,21.5042159 11.7064842,21.5122541 L11.6898409,22 L5.9037222,22 L5.88707891,21.5122541 C5.88696256,21.5094685 5.88696256,21.5094685 5.88613125,21.4958545 C5.88422324,21.4662328 5.88422324,21.4662328 5.88317288,21.4151367 L5.88317288,18.7439679 C4.73718564,18.1536967 3.89358165,17.3204474 3.34346829,16.2092361 L2.04635298,16.2092361 C0.919585595,16.2092361 0,15.2409021 0,14.0537529 L0,11.0999564 C0,9.91338154 0.919912253,8.94372682 2.04635298,8.94372682 L3.020379,8.94372682 C3.17054712,8.41905254 3.35915448,7.91499202 3.58463505,7.43498726 L4.13610633,3.80522406 C4.32693178,2.55929827 5.41748156,2.01264475 6.45466634,2.64312207 L7.54453616,3.30601799 C9.18765427,2.44503022 11.1775949,2 13.4527747,2 C17.9977103,2 21.0929387,4.56958948 22.099739,8.91648372 C22.5498072,8.96194781 22.9142659,9.18173151 23.2301742,9.53540624 C23.4994341,9.84775098 23.681464,10.2301463 23.7571386,10.6398861 C23.8129163,10.88897 23.8413457,11.1097889 23.8413457,11.3315479 C23.8413457,11.6044592 23.797053,11.8642512 23.6994331,12.1069053 C23.6974386,12.1119627 23.695417,12.1170122 23.6933684,12.1220534 L24,12.1220534 Z M22.9221014,12.9048706 C22.8354481,12.8434236 22.748235,12.7671337 22.6596628,12.6774819 L22.2977937,12.3112016 L22.6610129,11.9464081 C22.7267288,11.8804073 22.7812437,11.7982898 22.813972,11.7153337 C22.8594744,11.6022133 22.8810579,11.4756186 22.8810579,11.3315479 C22.8810579,11.1953784 22.8623719,11.0502396 22.8186079,10.8531626 C22.7726475,10.6055034 22.6706644,10.3912647 22.5251738,10.222374 C22.3466744,10.0225955 22.1706149,9.92436179 21.944406,9.91977551 C21.9170659,9.9194398 21.878068,9.92479296 21.8272362,9.93704304 L21.3488752,10.0523245 L21.249908,9.54588821 C20.4415745,5.40947193 17.6857608,3.0118494 13.4527747,3.0118494 C11.2164585,3.0118494 9.29808899,3.46504846 7.75668997,4.32878477 L7.52170686,4.4604596 L7.29120726,4.3202619 L5.97469802,3.51951615 C5.52008696,3.24317007 5.16786133,3.41972816 5.08422434,3.9658031 L4.52118238,7.67172665 L4.47557375,7.82001099 C4.21148172,8.37044661 4.00156449,8.9581142 3.84898619,9.57687919 L3.7556051,9.95557622 L2.04635298,9.95557622 C1.45034195,9.95557622 0.960287852,10.472129 0.960287852,11.0999564 L0.960287852,14.0537529 C0.960287852,14.6819263 1.44979868,15.1973867 2.04635298,15.1973867 L3.95308964,15.1973867 L4.08087794,15.4944396 C4.56250732,16.6140208 5.36789352,17.410009 6.55562637,17.9570649 L6.84346073,18.089638 L6.84346073,20.9881506 L10.7490672,20.9881506 L10.7490672,18.8808932 L11.2567328,18.9116053 C11.9211845,18.9518026 12.6441865,18.9707095 13.4527747,18.9707095 C13.7075098,18.9707095 13.7671698,18.9677715 13.7888421,18.9630655 C13.9284077,18.9327597 13.9870846,18.9235907 14.2193677,18.9046467 L14.7365638,18.8624665 L14.7365638,20.9881506 L18.6422792,20.9881506 L18.6422792,17.7332386 L18.8789264,17.5865161 C20.3961368,16.6458374 21.2328482,15.2339655 21.4465862,13.3280826 L21.5628131,12.2916976 L22.2629967,13.0297858 C22.3771343,13.1501023 22.4957233,13.2558469 22.6179649,13.3459757 C22.7368171,13.4327161 22.8532755,13.5027326 22.9695193,13.5558424 L22.9982886,12.9576865 C22.9726465,12.9410494 22.9472073,12.9234172 22.9221014,12.9048706 Z M5.99950744,11 C5.4474606,11 5,10.5520118 5,9.99991794 C5,9.44716759 5.4474606,9 5.99950744,9 C6.55166375,9 7,9.44716759 7,9.99991794 C7,10.5520118 6.55166375,11 5.99950744,11 Z M16.4737023,6.95007735 C15.5084255,6.57565748 14.3954806,6.36540043 13.1194091,6.36540043 C11.7968463,6.36540043 10.5747629,6.59058833 9.46576971,7 L9,5.72096882 C10.2743281,5.25160403 11.6615139,5 13.1381956,5 C14.5616446,5 15.848351,5.23414641 17,5.67977497 L16.4737023,6.95007735 Z"
})));
PiggyBank.displayName = "DecorativeIcon";

const Play = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M15.4068645,11.9219613 L9.75421935,15.7144774 L9.75421935,8.20273548 L15.4068645,11.9219613 Z M9.55809032,6.84428387 L16.6610581,11.5761548 C16.7622194,11.6742194 16.8768,11.7867355 16.8768,12.0004129 C16.8768,12.2130581 16.7622194,12.3255742 16.6796387,12.4081548 L9.53847742,17.1720258 C9.44247742,17.2731871 9.31963871,17.2731871 9.22983226,17.2731871 C9.17512258,17.2731871 9.03576774,17.2731871 8.97383226,17.1792516 C8.8128,17.1307355 8.7044129,16.9645419 8.7044129,16.7477677 L8.7044129,7.25202581 C8.7044129,6.99396129 8.85925161,6.80609032 9.07189677,6.80609032 C9.1204129,6.80609032 9.16892903,6.7968 9.21331613,6.78854194 C9.32376774,6.76892903 9.46105806,6.74621935 9.55809032,6.84428387 Z M22.9501935,7.2516129 C22.9501935,4.96206452 21.0157419,3.0276129 18.7261935,3.0276129 L5.27277419,3.0276129 C2.98322581,3.0276129 1.04877419,4.96206452 1.04877419,7.2516129 L1.04877419,16.7483871 C1.04877419,19.0369032 2.98322581,20.9723871 5.27277419,20.9723871 L18.7261935,20.9723871 C21.0157419,20.9723871 22.9501935,19.0369032 22.9501935,16.7483871 L22.9501935,7.2516129 Z M18.7261935,1.97883871 C21.6340645,1.97883871 24,4.34374194 24,7.2516129 L24,16.7483871 C24,19.6552258 21.6340645,22.0211613 18.7261935,22.0211613 L5.27277419,22.0211613 C2.36490323,22.0211613 -9.09494702e-13,19.6552258 -9.09494702e-13,16.7483871 L-9.09494702e-13,7.2516129 C-9.09494702e-13,4.34374194 2.36490323,1.97883871 5.27277419,1.97883871 L18.7261935,1.97883871 Z"
})));
Play.displayName = "DecorativeIcon";

const Preference = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M4.0459,4.0459 C3.1589,4.9329 3.1589,6.3779 4.0459,7.2649 C4.9339,8.1519 6.3769,8.1519 7.2649,7.2649 C8.1519,6.3779 8.1519,4.9329 7.2649,4.0459 C6.8209,3.6019 6.2379,3.3799 5.6549,3.3799 C5.0719,3.3799 4.4899,3.6019 4.0459,4.0459 Z M5.6549,8.9299 C4.8169,8.9299 3.9779,8.6099 3.3389,7.9719 C2.0619,6.6939 2.0619,4.6159 3.3389,3.3389 C4.6159,2.0619 6.6939,2.0619 7.9719,3.3389 C9.2489,4.6159 9.2489,6.6939 7.9719,7.9719 C7.3329,8.6099 6.4939,8.9299 5.6549,8.9299 Z M19.9541,19.9541 C20.8421,19.0661 20.8421,17.6231 19.9541,16.7351 C19.5111,16.2921 18.9281,16.0701 18.3451,16.0701 C17.7621,16.0701 17.1791,16.2921 16.7351,16.7351 C15.8481,17.6231 15.8481,19.0661 16.7351,19.9541 C17.6221,20.8411 19.0671,20.8411 19.9541,19.9541 Z M16.0281,16.0281 C17.3061,14.7511 19.3841,14.7511 20.6611,16.0281 C21.9381,17.3061 21.9381,19.3841 20.6611,20.6611 C20.0221,21.3001 19.1831,21.6191 18.3451,21.6191 C17.5061,21.6191 16.6671,21.3001 16.0281,20.6611 C14.7511,19.3841 14.7511,17.3061 16.0281,16.0281 Z M18.3447,23 C20.9117,23 22.9997,20.912 22.9997,18.345 C22.9997,15.777 20.9117,13.689 18.3447,13.689 L5.6557,13.689 C3.0887,13.689 0.9997,15.777 0.9997,18.345 C0.9997,20.912 3.0887,23 5.6557,23 L18.3447,23 Z M18.3447,12.689 C21.4627,12.689 23.9997,15.227 23.9997,18.345 C23.9997,21.463 21.4627,24 18.3447,24 L5.6557,24 C2.5367,24 -0.0003,21.463 -0.0003,18.345 C-0.0003,15.227 2.5367,12.689 5.6557,12.689 L18.3447,12.689 Z M5.6553,1 C3.0883,1 1.0003,3.088 1.0003,5.655 C1.0003,8.222 3.0883,10.311 5.6553,10.311 L18.3443,10.311 C20.9123,10.311 23.0003,8.222 23.0003,5.655 C23.0003,3.088 20.9123,1 18.3443,1 L5.6553,1 Z M5.6553,11.311 C2.5373,11.311 0.0003,8.773 0.0003,5.655 C0.0003,2.537 2.5373,-7.10542736e-15 5.6553,-7.10542736e-15 L18.3443,-7.10542736e-15 C21.4633,-7.10542736e-15 24.0003,2.537 24.0003,5.655 C24.0003,8.773 21.4633,11.311 18.3443,11.311 L5.6553,11.311 Z"
})));
Preference.displayName = "DecorativeIcon";

const PrivateCloud = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M15.5,16 L15,16 L15,15.5 C15,13.57 13.43,12 11.5,12 C9.57,12 8,13.57 8,15.5 L8,16 L7.5,16 C7.224,16 7,16.224 7,16.5 L7,22.5 C7,22.776 7.224,23 7.5,23 L15.5,23 C15.776,23 16,22.776 16,22.5 L16,16.5 C16,16.224 15.776,16 15.5,16 Z M9,15.5 C9,14.122 10.121,13 11.5,13 C12.879,13 14,14.122 14,15.5 L14,16 L9,16 L9,15.5 Z M15,22 L8,22 L8,17 L8.5,17 L14.5,17 L15,17 L15,22 Z M18.5,18 C18.224,18 18,17.776 18,17.5 C18,17.224 18.224,17 18.5,17 C20.981,17 23,14.981 23,12.5 C23,10.019 20.981,8 18.5,8 C18.223,7.973 17.962,7.829 17.927,7.578 C17.474,4.398 14.711,2 11.5,2 C7.916,2 5,4.916 5,8.5 C5,8.78 5.024,9.078 5.076,9.438 C5.097,9.583 5.053,9.73 4.956,9.84 C4.858,9.949 4.7,9.996 4.572,10.009 C4.55,10.009 4.489,10.003 4.467,9.999 C2.57,10 1,11.57 1,13.5 C1,15.43 2.57,17 4.5,17 C4.776,17 5,17.224 5,17.5 C5,17.776 4.776,18 4.5,18 C2.019,18 1.73472348e-18,15.981 1.73472348e-18,13.5 C1.73472348e-18,11.18 1.765,9.265 4.022,9.025 C4.007,8.842 4,8.669 4,8.5 C4,4.364 7.364,1 11.5,1 C15.065,1 18.151,3.561 18.846,7.023 C21.758,7.232 24,9.609 24,12.5 C24,15.533 21.533,18 18.5,18 Z"
})));
PrivateCloud.displayName = "DecorativeIcon";

const ProactiveAssurance = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20px",
  height: "20px",
  viewBox: "0 0 20 20"
}, /*#__PURE__*/React.createElement("path", {
  d: "M.44 9.167c.86.05 3.715.27 4.43.946.092.087.138.212.128.339a8.6 8.6 0 01-.053.451l7.228 1.606c1.234.308 1.85.922 1.969 1.964l2.7-.675a2.723 2.723 0 013.115 1.432.42.42 0 01-.2.567l-4.584 2.083c-2.175.89-3.165 1.26-4.01 1.26-.543 0-1.026-.152-1.727-.417l-5.97-1.99-.153.48a.416.416 0 01-.396.287h-2.5A.417.417 0 010 17.083v-7.5c0-.115.047-.225.13-.304a.428.428 0 01.31-.112zm4.364 2.56c-.273 1.393-.75 3.076-1.093 4.21l6.004 2.001c1.502.567 1.623.613 5.127-.823l4.13-1.878c-.46-.558-1.2-.811-1.929-.63l-3.192.798h-.004l-1.118.28a2.922 2.922 0 01-1.278.03l-3.616-.723a.416.416 0 01-.327-.49.411.411 0 01.49-.327l3.615.723c.302.06.618.054.914-.021l.8-.2c-.051-.761-.422-1.124-1.345-1.355zM.833 10.03v6.637h1.78c.31-.98 1.309-4.221 1.53-6.046-.525-.255-1.971-.485-3.31-.59zM15.55 0c.458 0 .837.344.893.787L16.45.9l-.001 2.6h2.601c.42 0 .774.289.872.679l.021.108.007.113v2.5a.901.901 0 01-.787.893l-.113.007h-2.601l.001 2.6c0 .42-.289.774-.679.872l-.108.021-.113.007h-2.5a.901.901 0 01-.893-.787l-.007-.113-.001-2.6H9.55a.901.901 0 01-.872-.679l-.021-.108L8.65 6.9V4.4c0-.458.344-.837.787-.893L9.55 3.5h2.599L12.15.9c0-.42.289-.774.679-.872l.108-.021L13.05 0h2.5zm0 .8h-2.5a.1.1 0 00-.092.061L12.95.9v3a.4.4 0 01-.32.392l-.08.008h-3a.1.1 0 00-.092.061L9.45 4.4v2.5a.1.1 0 00.061.092L9.55 7h3a.4.4 0 01.392.32l.008.08v3a.1.1 0 00.061.092l.039.008h2.5a.1.1 0 00.092-.061l.008-.039v-3a.4.4 0 01.32-.392L16.05 7h3a.1.1 0 00.092-.061l.008-.039V4.4a.1.1 0 00-.061-.092L19.05 4.3h-3a.4.4 0 01-.392-.32l-.008-.08v-3a.1.1 0 00-.1-.1z"
})));
ProactiveAssurance.displayName = "DecorativeIcon";

const Radar = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M20.485,3.515 C20.284,3.314 19.931,3.313 19.728,3.515 C19.521,3.723 19.521,4.062 19.728,4.271 C21.794,6.335 22.93,9.08 22.93,12 C22.93,18.028 18.027,22.931 12,22.931 C5.972,22.931 1.068,18.028 1.068,12 C1.068,6.133 5.625,1.362 11.465,1.082 L11.465,3.303 C6.863,3.583 3.276,7.381 3.276,12 C3.276,16.811 7.189,20.725 12,20.725 C16.81,20.725 20.724,16.811 20.724,12 C20.724,9.67 19.817,7.48 18.17,5.831 C18.068,5.73 17.933,5.675 17.791,5.675 L17.79,5.675 C17.647,5.675 17.513,5.731 17.414,5.831 C17.312,5.932 17.256,6.066 17.256,6.209 C17.256,6.352 17.312,6.486 17.413,6.587 C18.859,8.033 19.655,9.955 19.655,12 C19.655,16.221 16.22,19.656 12,19.656 C7.778,19.656 4.344,16.221 4.344,12 C4.344,7.976 7.462,4.652 11.465,4.374 L11.465,6.583 C8.7,6.854 6.551,9.212 6.551,12 C6.551,15.004 8.995,17.449 12,17.449 C15.004,17.449 17.448,15.004 17.448,12 C17.448,10.545 16.881,9.177 15.852,8.148 C15.651,7.947 15.298,7.946 15.095,8.148 C14.888,8.356 14.888,8.695 15.096,8.904 C15.923,9.73 16.379,10.83 16.379,12 C16.379,14.414 14.414,16.379 12,16.379 C9.585,16.379 7.62,14.414 7.62,12 C7.62,9.804 9.298,7.922 11.465,7.656 L11.465,10.763 C10.972,10.975 10.646,11.462 10.646,12 C10.646,12.746 11.254,13.354 12,13.354 C12.746,13.354 13.353,12.746 13.353,12 C13.353,11.462 13.027,10.975 12.534,10.763 L12.534,0.535 C12.534,0.24 12.295,1.0658141e-14 12,1.0658141e-14 C5.383,1.0658141e-14 9.09494702e-13,5.384 9.09494702e-13,12 C9.09494702e-13,18.618 5.383,24 12,24 C18.617,24 24,18.618 24,12 C24,8.795 22.752,5.781 20.485,3.515"
})));
Radar.displayName = "DecorativeIcon";

const Receipt = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M16.2031,14.6725 C16.4791,14.6725 16.7031,14.8965 16.7031,15.1725 C16.7031,15.4485 16.4791,15.6725 16.2031,15.6725 L10.0171,15.6725 C9.7411,15.6725 9.5171,15.4485 9.5171,15.1725 C9.5171,14.8965 9.7411,14.6725 10.0171,14.6725 L16.2031,14.6725 Z M16.2031,11.4997 C16.4791,11.4997 16.7031,11.7237 16.7031,11.9997 C16.7031,12.2757 16.4791,12.4997 16.2031,12.4997 L10.0171,12.4997 C9.7411,12.4997 9.5171,12.2757 9.5171,11.9997 C9.5171,11.7237 9.7411,11.4997 10.0171,11.4997 L16.2031,11.4997 Z M16.2031,17.8444 C16.4791,17.8444 16.7031,18.0684 16.7031,18.3444 C16.7031,18.6204 16.4791,18.8444 16.2031,18.8444 L10.0171,18.8444 C9.7411,18.8444 9.5171,18.6204 9.5171,18.3444 C9.5171,18.0684 9.7411,17.8444 10.0171,17.8444 L16.2031,17.8444 Z M10.517,8.3272 L19.827,8.3272 L19.827,5.3622 L10.517,5.3622 L10.517,8.3272 Z M20.327,4.3622 C20.604,4.3622 20.827,4.5852 20.827,4.8622 L20.827,8.8272 C20.827,9.1032 20.604,9.3272 20.327,9.3272 L10.017,9.3272 C9.741,9.3272 9.517,9.1032 9.517,8.8272 L9.517,4.8622 C9.517,4.5852 9.741,4.3622 10.017,4.3622 L20.327,4.3622 Z M20.3271,11.4997 C20.6031,11.4997 20.8271,11.7237 20.8271,11.9997 C20.8271,12.2757 20.6031,12.4997 20.3271,12.4997 L17.8691,12.4997 C17.5931,12.4997 17.3691,12.2757 17.3691,11.9997 C17.3691,11.7237 17.5931,11.4997 17.8691,11.4997 L20.3271,11.4997 Z M20.3271,14.6725 C20.6031,14.6725 20.8271,14.8965 20.8271,15.1725 C20.8271,15.4485 20.6031,15.6725 20.3271,15.6725 L17.8691,15.6725 C17.5931,15.6725 17.3691,15.4485 17.3691,15.1725 C17.3691,14.8965 17.5931,14.6725 17.8691,14.6725 L20.3271,14.6725 Z M20.3271,17.8444 C20.6031,17.8444 20.8271,18.0684 20.8271,18.3444 C20.8271,18.6204 20.6031,18.8444 20.3271,18.8444 L17.8691,18.8444 C17.5931,18.8444 17.3691,18.6204 17.3691,18.3444 C17.3691,18.0684 17.5931,17.8444 17.8691,17.8444 L20.3271,17.8444 Z M23,19.2965 L23,3.6715 C23,2.8405 22.349,2.1895 21.518,2.1895 L8.828,2.1895 C7.996,2.1895 7.345,2.8405 7.345,3.6715 L7.345,19.1375 C7.345,20.2005 6.915,21.1455 6.215,21.8105 L20.486,21.8105 C21.872,21.8105 23,20.6825 23,19.2965 Z M3.672,21.8105 C5.345,21.8105 6.345,20.4505 6.345,19.1375 L6.345,12.4995 L1,12.4995 L1,19.2165 C1,20.6705 2.174,21.8105 3.672,21.8105 Z M21.518,1.1895 C22.909,1.1895 24,2.2795 24,3.6715 L24,19.2965 C24,21.2335 22.424,22.8105 20.486,22.8105 L3.672,22.8105 C1.613,22.8105 0,21.2325 0,19.2165 L0,11.9995 C0,11.7235 0.224,11.4995 0.5,11.4995 L6.345,11.4995 L6.345,3.6715 C6.345,2.2795 7.436,1.1895 8.828,1.1895 L21.518,1.1895 Z"
})));
Receipt.displayName = "DecorativeIcon";

const Record = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "10",
  viewBox: "0 0 24 10"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(0 -7)",
  d: "M19,17 L5,17 C4.724,17 4.5,16.776 4.5,16.5 C4.5,16.224 4.724,16 5,16 L19,16 C19.276,16 19.5,16.224 19.5,16.5 C19.5,16.776 19.276,17 19,17 Z M5,17 C2.243,17 0,14.757 0,12 C0,9.243 2.243,7 5,7 C7.757,7 10,9.243 10,12 C10,14.757 7.757,17 5,17 Z M5,8 C2.794,8 1,9.794 1,12 C1,14.206 2.794,16 5,16 C7.206,16 9,14.206 9,12 C9,9.794 7.206,8 5,8 Z M19,17 C16.243,17 14,14.757 14,12 C14,9.243 16.243,7 19,7 C21.757,7 24,9.243 24,12 C24,14.757 21.757,17 19,17 Z M19,8 C16.794,8 15,9.794 15,12 C15,14.206 16.794,16 19,16 C21.206,16 23,14.206 23,12 C23,9.794 21.206,8 19,8 Z"
})));
Record.displayName = "DecorativeIcon";

const Refresh = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M23.4805,11.4805 C23.7665,11.4805 24.0005,11.7135 24.0005,12.0005 C24.0005,18.6165 18.6165,24.0005 12.0005,24.0005 C7.4755,24.0005 3.6935,21.4465 1.0395,16.6075 L1.0395,19.5215 C1.0395,19.8085 0.8065,20.0415 0.5195,20.0415 C0.2325,20.0415 0.0005,19.8085 0.0005,19.5215 L0.0005,15.5625 C0.0005,15.2765 0.2325,15.0435 0.5195,15.0435 L4.4785,15.0435 C4.7645,15.0435 4.9975,15.2765 4.9975,15.5625 C4.9975,15.8495 4.7645,16.0825 4.4785,16.0825 L1.9325,16.0825 C3.6735,19.2645 6.8145,22.9605 12.0005,22.9605 C18.0435,22.9605 22.9605,18.0435 22.9605,12.0005 C22.9605,11.7135 23.1945,11.4805 23.4805,11.4805 Z M23.4805,3.959 C23.7665,3.959 24.0005,4.192 24.0005,4.478 L24.0005,8.437 C24.0005,8.724 23.7665,8.957 23.4805,8.957 L19.5215,8.957 C19.2355,8.957 19.0015,8.724 19.0015,8.437 C19.0015,8.15 19.2355,7.917 19.5215,7.917 L22.0685,7.917 C20.3265,4.736 17.1855,1.039 12.0005,1.039 C5.9565,1.039 1.0395,5.956 1.0395,12 C1.0395,12.287 0.8065,12.52 0.5195,12.52 C0.2325,12.52 0.0005,12.287 0.0005,12 C0.0005,5.383 5.3835,-8.8817842e-15 12.0005,-8.8817842e-15 C16.5265,-8.8817842e-15 20.3065,2.554 22.9605,7.392 L22.9605,4.478 C22.9605,4.192 23.1945,3.959 23.4805,3.959 Z"
})));
Refresh.displayName = "DecorativeIcon";

const RemoteControl = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "14",
  height: "24",
  viewBox: "0 0 14 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-5)",
  d: "M12.3901128,13.2329185 L12.8656571,13.7094618 C13.0614695,13.9042751 13.0614695,14.2199725 12.8656571,14.4157849 C12.7677509,14.512692 12.6398735,14.5616451 12.5129951,14.5616451 C12.3851176,14.5616451 12.2572402,14.512692 12.159334,14.4157849 L12.0364518,14.2929026 L11.9135695,14.4157849 C11.7187562,14.6105982 11.4030588,14.6105982 11.2072464,14.4157849 C11.0124331,14.2199725 11.0124331,13.9042751 11.2072464,13.7094618 L11.6837897,13.2329185 C11.7776997,13.1390085 11.9045781,13.0870582 12.0364518,13.0870582 C12.1693244,13.0870582 12.2962028,13.1390085 12.3901128,13.2329185 Z M9.54463975,16.811489 L9.69349709,16.9603463 C9.8883104,17.1561587 9.8883104,17.4718561 9.69349709,17.6666694 C9.59559092,17.7645756 9.46771347,17.8135287 9.33983602,17.8135287 C9.21195857,17.8135287 9.08508016,17.7645756 8.98717399,17.6666694 L8.51063067,17.1911252 C8.3258078,17.0063023 8.31481833,16.7105857 8.48465557,16.5127753 L8.96119888,15.9583066 C9.14102655,15.7485077 9.456724,15.7255297 9.6655239,15.9033593 C9.87532284,16.0831869 9.89830082,16.3988844 9.7194722,16.6076843 L9.54463975,16.811489 Z M12.159334,19.1813179 C12.3541473,18.9865046 12.6708438,18.9865046 12.8656571,19.1813179 C13.0614695,19.3761312 13.0614695,19.6928277 12.8656571,19.887641 L12.3901128,20.3641843 C12.2962028,20.4570953 12.1693244,20.5100445 12.0364518,20.5100445 C11.9045781,20.5100445 11.7776997,20.4570953 11.6837897,20.3641843 L11.2072464,19.887641 C11.0124331,19.6928277 11.0124331,19.3761312 11.2072464,19.1813179 C11.4030588,18.9865046 11.7187562,18.9865046 11.9135695,19.1813179 L12.0364518,19.3042001 L12.159334,19.1813179 Z M15.0077043,15.9295342 L15.563172,16.4850019 C15.6610782,16.582908 15.7140274,16.7177788 15.7090322,16.8576448 C15.703038,16.9955126 15.6410973,17.1263872 15.5341998,17.2173001 L14.9797311,17.6938434 C14.8858211,17.7737668 14.7699322,17.8137285 14.6540432,17.8137285 C14.5141773,17.8137285 14.3743113,17.753786 14.2754061,17.6388961 C14.0955784,17.4300962 14.1195555,17.1143987 14.3293544,16.934571 L14.4752146,16.8096907 L14.3013812,16.6358573 C14.1065679,16.441044 14.1065679,16.1243475 14.3013812,15.9295342 C14.4961945,15.7347209 14.812891,15.7347209 15.0077043,15.9295342 Z M9.52615746,4.01615119 C9.77392002,3.76838863 10.1755351,3.76838863 10.4232977,4.01615119 C10.6710603,4.26391375 10.6710603,4.66552887 10.4232977,4.91329143 C10.1755351,5.16105399 9.77392002,5.16105399 9.52615746,4.91329143 C9.2783949,4.66552887 9.2783949,4.26391375 9.52615746,4.01615119 Z M12.4857212,4.91379095 C12.2379587,5.16155351 11.8363435,5.16155351 11.588581,4.91379095 C11.3408184,4.66602839 11.3408184,4.26441327 11.588581,4.01665071 C11.8363435,3.76888815 12.2379587,3.76888815 12.4857212,4.01665071 C12.7334838,4.26441327 12.7334838,4.66602839 12.4857212,4.91379095 Z M14.5481447,4.91379095 C14.3003822,5.16155351 13.898767,5.16155351 13.6510045,4.91379095 C13.4032419,4.66602839 13.4032419,4.26441327 13.6510045,4.01665071 C13.898767,3.76888815 14.3003822,3.76888815 14.5481447,4.01665071 C14.7959073,4.26441327 14.7959073,4.66602839 14.5481447,4.91379095 Z M9.52615746,7.2679349 C9.77392002,7.02017233 10.1755351,7.02017233 10.4232977,7.2679349 C10.6710603,7.51569746 10.6710603,7.91731258 10.4232977,8.16507514 C10.1755351,8.4128377 9.77392002,8.4128377 9.52615746,8.16507514 C9.2783949,7.91731258 9.2783949,7.51569746 9.52615746,7.2679349 Z M12.4857212,8.16547475 C12.2379587,8.41323731 11.8363435,8.41323731 11.588581,8.16547475 C11.3408184,7.91771219 11.3408184,7.51609707 11.588581,7.26833451 C11.8363435,7.02057195 12.2379587,7.02057195 12.4857212,7.26833451 C12.7334838,7.51609707 12.7334838,7.91771219 12.4857212,8.16547475 Z M14.5481447,8.16547475 C14.3003822,8.41323731 13.898767,8.41323731 13.6510045,8.16547475 C13.4032419,7.91771219 13.4032419,7.51609707 13.6510045,7.26833451 C13.898767,7.02057195 14.3003822,7.02057195 14.5481447,7.26833451 C14.7959073,7.51609707 14.7959073,7.91771219 14.5481447,8.16547475 Z M9.52615746,10.4406943 C9.77392002,10.1929318 10.1755351,10.1929318 10.4232977,10.4406943 C10.6710603,10.6884569 10.6710603,11.090072 10.4232977,11.3378346 C10.1755351,11.5855971 9.77392002,11.5855971 9.52615746,11.3378346 C9.2783949,11.090072 9.2783949,10.6884569 9.52615746,10.4406943 Z M12.4857212,11.3377347 C12.2379587,11.5854972 11.8363435,11.5854972 11.588581,11.3377347 C11.3408184,11.0899721 11.3408184,10.688357 11.588581,10.4405944 C11.8363435,10.1928319 12.2379587,10.1928319 12.4857212,10.4405944 C12.7334838,10.688357 12.7334838,11.0899721 12.4857212,11.3377347 Z M14.5481447,10.4406943 C14.7959073,10.6884569 14.7959073,11.090072 14.5481447,11.3378346 C14.3003822,11.5855971 13.898767,11.5855971 13.6510045,11.3378346 C13.4032419,11.090072 13.4032419,10.6884569 13.6510045,10.4406943 C13.898767,10.1929318 14.3003822,10.1929318 14.5481447,10.4406943 Z M12.4857212,17.2866336 C12.2379587,17.5343962 11.8363435,17.5343962 11.588581,17.2866336 C11.3408184,17.0388711 11.3408184,16.637256 11.588581,16.3894934 C11.8363435,16.1417308 12.2379587,16.1417308 12.4857212,16.3894934 C12.7334838,16.637256 12.7334838,17.0388711 12.4857212,17.2866336 Z M16.7814045,22.5004371 C16.9772169,22.2916372 17.2039995,21.9299838 17.1700321,21.3905008 L17.169033,2.56154519 C17.169033,1.68538484 16.4826908,0.999042584 15.6065304,0.999042584 L8.38844777,0.999042584 C7.51228742,0.999042584 6.82594516,1.68538484 6.82594516,2.56154519 L6.82594516,21.4384548 C6.82594516,22.3136161 7.51228742,23.0009574 8.38844777,23.0009574 L15.6065304,23.0009574 C16.0541015,23.0009574 16.4826908,22.8181326 16.7814045,22.5004371 Z M15.6065304,0 C17.0431537,0 18.1680756,1.12492195 18.1680756,2.56154519 L18.1680756,21.3585314 C18.2110345,22.0258919 17.9772585,22.686259 17.5097066,23.1847813 C17.0231728,23.7022853 16.3298373,24 15.6065304,24 L8.38844777,24 C6.95282357,24 5.82690258,22.8750781 5.82690258,21.4384548 L5.82690258,2.56154519 C5.82690258,1.12492195 6.95282357,0 8.38844777,0 L15.6065304,0 Z"
})));
RemoteControl.displayName = "DecorativeIcon";

const Router = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M17,14.121 L17,7.621 C17,7.345 17.224,7.121 17.5,7.121 C17.776,7.121 18,7.345 18,7.621 L18,14.121 L21.5,14.121 C22.878,14.121 24,15.243 24,16.621 L24,18.621 C24,20 22.878,21.121 21.5,21.121 L2.5,21.121 C1.122,21.121 0,19.999 0,18.621 L0,16.621 C0,15.243 1.122,14.121 2.5,14.121 L17,14.121 Z M2.5,15.121 C1.673,15.121 1,15.794 1,16.621 L1,18.621 C1,19.448 1.673,20.121 2.5,20.121 L21.5,20.121 C22.327,20.121 23,19.448 23,18.621 L23,16.621 C23,15.794 22.327,15.121 21.5,15.121 L2.5,15.121 Z M3.5,18.621 C2.94771525,18.621 2.5,18.1732847 2.5,17.621 C2.5,17.0687153 2.94771525,16.621 3.5,16.621 C4.05228475,16.621 4.5,17.0687153 4.5,17.621 C4.5,18.1732847 4.05228475,18.621 3.5,18.621 Z M6.5,18.621 C5.94771525,18.621 5.5,18.1732847 5.5,17.621 C5.5,17.0687153 5.94771525,16.621 6.5,16.621 C7.05228475,16.621 7.5,17.0687153 7.5,17.621 C7.5,18.1732847 7.05228475,18.621 6.5,18.621 Z M9.5,18.621 C8.94771525,18.621 8.5,18.1732847 8.5,17.621 C8.5,17.0687153 8.94771525,16.621 9.5,16.621 C10.0522847,16.621 10.5,17.0687153 10.5,17.621 C10.5,18.1732847 10.0522847,18.621 9.5,18.621 Z M12.5,18.621 C11.9477153,18.621 11.5,18.1732847 11.5,17.621 C11.5,17.0687153 11.9477153,16.621 12.5,16.621 C13.0522847,16.621 13.5,17.0687153 13.5,17.621 C13.5,18.1732847 13.0522847,18.621 12.5,18.621 Z M20.5,18.121 L15.5,18.121 C15.224,18.121 15,17.897 15,17.621 C15,17.345 15.224,17.121 15.5,17.121 L20.5,17.121 C20.776,17.121 21,17.345 21,17.621 C21,17.897 20.776,18.121 20.5,18.121 Z M16.086,9.535 C15.958,9.535 15.83,9.486 15.732,9.389 C15.26,8.917 15,8.289 15,7.621 C15,6.953 15.26,6.325 15.732,5.853 C15.927,5.658 16.244,5.658 16.439,5.853 C16.634,6.048 16.634,6.365 16.439,6.56 C16.156,6.844 16,7.22 16,7.621 C16,8.022 16.156,8.398 16.439,8.682 C16.634,8.877 16.634,9.194 16.439,9.389 C16.342,9.487 16.214,9.535 16.086,9.535 Z M18.914,9.535 C18.786,9.535 18.658,9.486 18.56,9.389 C18.365,9.194 18.365,8.877 18.56,8.682 C18.844,8.399 19,8.022 19,7.621 C19,7.22 18.844,6.844 18.561,6.56 C18.366,6.365 18.366,6.048 18.561,5.853 C18.756,5.658 19.073,5.658 19.268,5.853 C19.74,6.325 20,6.953 20,7.621 C20,8.289 19.74,8.917 19.268,9.389 C19.17,9.487 19.042,9.535 18.914,9.535 Z M14.671,10.95 C14.543,10.95 14.415,10.901 14.317,10.804 C12.563,9.049 12.563,6.195 14.317,4.44 C14.512,4.245 14.829,4.245 15.024,4.44 C15.219,4.635 15.219,4.952 15.024,5.147 C13.66,6.512 13.66,8.732 15.024,10.097 C15.219,10.292 15.219,10.609 15.024,10.804 C14.927,10.901 14.799,10.95 14.671,10.95 Z M20.329,10.95 C20.201,10.95 20.073,10.901 19.975,10.804 C19.78,10.609 19.78,10.292 19.975,10.097 C21.339,8.732 21.339,6.512 19.975,5.147 C19.78,4.952 19.78,4.635 19.975,4.44 C20.17,4.245 20.487,4.245 20.682,4.44 C22.436,6.195 22.436,9.049 20.682,10.804 C20.584,10.901 20.457,10.95 20.329,10.95 Z M13.257,12.364 C13.129,12.364 13.001,12.315 12.903,12.218 C10.369,9.684 10.369,5.56 12.903,3.026 C13.098,2.831 13.415,2.831 13.61,3.026 C13.805,3.221 13.805,3.538 13.61,3.733 C11.465,5.878 11.465,9.367 13.61,11.511 C13.805,11.706 13.805,12.023 13.61,12.218 C13.513,12.315 13.385,12.364 13.257,12.364 Z M21.743,12.364 C21.615,12.364 21.487,12.315 21.389,12.218 C21.194,12.023 21.194,11.706 21.389,11.511 C23.534,9.366 23.534,5.877 21.389,3.733 C21.194,3.538 21.194,3.221 21.389,3.026 C21.584,2.831 21.901,2.831 22.096,3.026 C24.63,5.56 24.63,9.684 22.096,12.218 C21.999,12.315 21.871,12.364 21.743,12.364 Z"
})));
Router.displayName = "DecorativeIcon";

const Sales = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20px",
  height: "20px",
  viewBox: "0 0 20 20"
}, /*#__PURE__*/React.createElement("path", {
  d: "M19.583 6.667c.23 0 .417.186.417.416v4.167a.417.417 0 01-.712.295L17.5 9.756l-5.956 5.956a.417.417 0 01-.589 0l-3.037-3.04-4.705 4.706a.416.416 0 11-.59-.589l5-5a.417.417 0 01.589 0l3.038 3.039 5.661-5.661-1.788-1.789a.416.416 0 01.295-.711h4.166zM7.083 0a7.091 7.091 0 017.084 7.083c0 2.36-1.17 4.556-3.129 5.877a.417.417 0 01-.466-.69A6.249 6.249 0 007.083.832a6.257 6.257 0 00-6.25 6.25 6.248 6.248 0 003.772 5.737.417.417 0 01-.33.765A7.08 7.08 0 010 7.083 7.091 7.091 0 017.083 0zm0 3.333c.23 0 .417.187.417.417v.449c.912.143 1.6.748 1.665 1.52a.417.417 0 01-.83.07c-.029-.34-.375-.628-.835-.74l.002 1.698c1.124.275 1.665.804 1.665 1.586 0 .805-.717 1.478-1.666 1.633l-.001.45a.417.417 0 01-.833 0l-.001-.448c-.912-.143-1.6-.75-1.664-1.52a.417.417 0 01.83-.07c.028.339.374.628.834.74L6.665 7.42C5.54 7.144 5 6.615 5 5.833c0-.804.717-1.477 1.666-1.633v-.45c0-.23.187-.417.417-.417zM19.167 7.5h-2.745l2.745 2.744V7.5zm-11.665.103l-.001 1.514c.48-.118.831-.43.831-.784 0-.334-.266-.57-.83-.73zM6.666 5.05c-.48.117-.833.429-.833.783 0 .334.267.57.832.73l.001-1.513z"
})));
Sales.displayName = "DecorativeIcon";

const SecurityCamera = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -3)",
  d: "M9.1881686,13.4342021 C9.38023,13.6164272 9.5,13.8741046 9.5,14.1597559 C9.5,14.7120406 9.05228475,15.1597559 8.5,15.1597559 C7.94771525,15.1597559 7.5,14.7120406 7.5,14.1597559 C7.5,13.6074711 7.94771525,13.1597559 8.5,13.1597559 C8.54669717,13.1597559 8.59264676,13.1629567 8.63764134,13.1691508 L7.87925778,12.8040272 C7.3464554,13.0449741 7,13.5687842 7,14.1597559 C7,14.9867559 7.673,15.6597559 8.5,15.6597559 C9.327,15.6597559 10,14.9867559 10,14.1597559 C10,14.0425187 9.98429194,13.9230375 9.95317647,13.802515 L9.1881686,13.4342021 Z M19.0126216,10.8254045 L21.016,11.6267559 L22.342,11.1847559 C22.469,11.1427559 22.606,11.1527559 22.724,11.2117559 L23.724,11.7117559 C23.964,11.8317559 24.067,12.1207559 23.955,12.3657559 L21.455,17.8657559 C21.399,17.9897559 21.295,18.0847559 21.167,18.1297559 C21.112,18.1497559 21.057,18.1597559 21,18.1597559 C20.923,18.1597559 20.847,18.1417559 20.776,18.1067559 L19.776,17.6067559 C19.658,17.5467559 19.567,17.4427559 19.525,17.3177559 L19.084,15.9927559 L17.1603995,14.8382669 L16.88,15.4457559 C16.71,15.8137559 16.406,16.0917559 16.026,16.2287559 C15.859,16.2887559 15.688,16.3177559 15.517,16.3177559 C15.295,16.3177559 15.075,16.2677559 14.868,16.1687559 L10.9958575,14.3045136 C10.930314,15.4467823 10.094161,16.3865848 9,16.6095377 L9,20.1597559 C9,20.4357559 8.776,20.6597559 8.5,20.6597559 L0.5,20.6597559 C0.224,20.6597559 0,20.4357559 0,20.1597559 C0,19.8837559 0.224,19.6597559 0.5,19.6597559 L8,19.6597559 L8,16.6095377 C6.85994766,16.3772337 6,15.3666868 6,14.1597559 C6,13.4308554 6.31423865,12.7631065 6.83535832,12.301442 L3.17,10.5367559 C2.437,10.1837559 2.117,9.2957559 2.458,8.5567559 L4.62,3.8727559 C4.79,3.5047559 5.094,3.2267559 5.475,3.0897559 C5.856,2.9517559 6.266,2.9737559 6.633,3.1497559 L18.33,8.7817559 C19.063,9.1347559 19.383,10.0227559 19.042,10.7617559 L19.0126216,10.8254045 Z M18.5928302,11.734888 L17.5816777,13.9255625 L19.757,15.2307559 C19.86,15.2927559 19.937,15.3877559 19.975,15.5017559 L20.41,16.8057559 L20.761,16.9807559 L22.847,12.3917559 L22.463,12.1997559 L21.159,12.6337559 C21.046,12.6717559 20.926,12.6667559 20.815,12.6237559 L18.5928302,11.734888 Z M10.6018957,13.0056611 L15.3,15.2677559 C15.423,15.3267559 15.56,15.3337559 15.686,15.2877559 C15.814,15.2427559 15.915,15.1497559 15.971,15.0267559 L18.133,10.3427559 C18.246,10.0967559 18.14,9.8007559 17.896,9.6827559 L6.199,4.0507559 C6.131,4.0177559 6.057,4.0007559 5.982,4.0007559 C5.925,4.0007559 5.868,4.0107559 5.813,4.0307559 C5.686,4.0767559 5.585,4.1687559 5.528,4.2917559 L3.366,8.9757559 C3.253,9.2217559 3.359,9.5177559 3.603,9.6357559 L8.11407514,11.8077979 C8.11778882,11.8095302 8.12147846,11.8113068 8.12514539,11.8131281 L10.5576814,12.9843723 C10.5727583,12.9907404 10.587515,12.9978453 10.6018957,13.0056611 Z"
})));
SecurityCamera.displayName = "DecorativeIcon";

const SecurityHouse = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M23.5,17 L23,17 L23,16.5 C23,14.57 21.43,13 19.5,13 C17.57,13 16,14.57 16,16.5 L16,17 L15.5,17 C15.224,17 15,17.224 15,17.5 L15,23.5 C15,23.776 15.224,24 15.5,24 L23.5,24 C23.776,24 24,23.776 24,23.5 L24,17.5 C24,17.224 23.776,17 23.5,17 Z M17,16.5 C17,15.122 18.121,14 19.5,14 C20.879,14 22,15.122 22,16.5 L22,17 L17,17 L17,16.5 Z M23,23 L16,23 L16,18 L16.5,18 L22.5,18 L23,18 L23,23 Z M13.5,19 C13.776,19 14,19.224 14,19.5 C14,19.776 13.776,20 13.5,20 L8.5,20 C8.224,20 8,19.776 8,19.5 L8,12.5 C8,12.224 8.224,12 8.5,12 L15.5,12 C15.776,12 16,12.224 16,12.5 L16,13.5 C16,13.776 15.776,14 15.5,14 C15.224,14 15,13.776 15,13.5 L15,13 L9,13 L9,19 L13.5,19 Z M13.5,23 C13.776,23 14,23.224 14,23.5 C14,23.776 13.776,24 13.5,24 L3.5,24 C3.224,24 3,23.776 3,23.5 L3,12 L0.5,12 C0.298,12 0.115,11.878 0.038,11.691 C-0.039,11.504 0.004,11.289 0.146,11.146 L10.794,0.5 C11.432,-0.141 12.568,-0.139 13.206,0.5 L16,3.293 L16,0.5 C16,0.224 16.224,0 16.5,0 L20.5,0 C20.776,0 21,0.224 21,0.5 L21,8.293 L23.854,11.147 C23.997,11.29 24.04,11.505 23.962,11.692 C23.884,11.879 23.702,12 23.5,12 L20.5,12 C20.224,12 20,11.776 20,11.5 C20,11.224 20.224,11 20.5,11 L22.293,11 L20.147,8.854 C20.053,8.76 20,8.633 20,8.5 L20,1 L17,1 L17,4.5 C17,4.702 16.878,4.885 16.691,4.962 C16.505,5.041 16.291,4.997 16.146,4.854 L12.499,1.207 C12.234,0.942 11.764,0.944 11.501,1.207 L1.707,11 L3.5,11 C3.776,11 4,11.224 4,11.5 L4,23 L13.5,23 Z M19.5,19 C18.948,19 18.5,19.448 18.5,20 C18.5,20.366 18.706,20.673 19,20.847 L19,21.5 C19,21.776 19.224,22 19.5,22 C19.776,22 20,21.776 20,21.5 L20,20.847 C20.294,20.673 20.5,20.366 20.5,20 C20.5,19.448 20.052,19 19.5,19 Z"
})));
SecurityHouse.displayName = "DecorativeIcon";

const SecurityMobile = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "24",
  viewBox: "0 0 16 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-4)",
  d: "M15.5,23 L7.5,23 C6.621,23 5.5,21.878 5.5,20 L5.5,19 L18.5,19 L18.5,20 C18.5,21.878 17.379,23 15.5,23 L15.5,23 Z M7.5,1 L15.5,1 C17.379,1 18.5,2.122 18.5,3 L18.5,4 L5.5,4 L5.5,3 C5.5,2.122 6.621,1 7.5,1 L7.5,1 Z M5.5,18 L18.5,18 L18.5,5 L5.5,5 L5.5,18 Z M16.5,1.42108547e-14 L8.5,1.42108547e-14 C6.07,1.42108547e-14 4.5,1.57 4.5,4 L4.5,21 C4.5,22.43 6.07,24 8.5,24 L16.5,24 C17.93,24 19.5,22.43 19.5,21 L19.5,4 C19.5,1.57 17.93,1.42108547e-14 16.5,1.42108547e-14 L16.5,1.42108547e-14 Z M11.5,11 L11.5,9 L12.5,9 L12.5,11 L11.5,11 Z M11,3 C10.724,3 10.5,2.776 10.5,2.5 C10.5,2.224 10.724,2 11,2 L11.993,2 L12.002,2 L13,2 C13.276,2 13.5,2.224 13.5,2.5 C13.5,2.776 13.276,3 13,3 L11,3 Z M11.5,14 L12.5,14 L12.5,12 L11.5,12 L11.5,14 Z M10.5,11 L10.5,12 L10.5,14 L10.5,15 C10.5,15 10.972,15.024 11.5,15 L13.5,14 L13.5,12 L13.5,11 L13.5,9 L13.5,8 C13.5,8 13.028,7.976 12.5,8 L10.5,9 L10.5,11 Z M15.5,14 C15.5,14.098 11.825,16 11.825,16 C11.825,16 8.5,14.099 8.5,14 L8.5,8 L12,7 L15.5,8 L15.5,14 Z M12.5,6 L16.5,7 L16.5,14 C16.5,15.048 13.023,16.542 12.321,17 C11.952,16.987 11.886,17.001 11.321,17 C11.756,17.001 11.689,16.987 11.321,17 C10.618,16.542 7.5,15.048 7.5,14 L7.5,7 L11.5,6 C11.959,5.995 12.041,5.995 12.5,6 Z M12,20 C12.553,20 13,20.447 13,21 C13,21.553 12.553,22 12,22 C11.448,22 11,21.553 11,21 C11,20.447 11.448,20 12,20 Z"
})));
SecurityMobile.displayName = "DecorativeIcon";

const SecuritySettings = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "24",
  viewBox: "0 0 22 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1)",
  d: "M12,24 C11.95,24 11.899,23.993 11.852,23.978 C8.242,22.855 1.5,18.922 1.5,14.5 L1.5,3.5 C1.5,3.279 1.645,3.084 1.856,3.021 L11.856,0.021 C11.95,-0.007 12.049,-0.007 12.143,0.021 L22.143,3.021 C22.355,3.085 22.5,3.279 22.5,3.5 L22.5,14.5 C22.5,18.922 15.758,22.854 12.148,23.978 C12.101,23.993 12.05,24 12,24 Z M2.5,3.872 L2.5,14.5 C2.5,18.011 8.063,21.703 12,22.976 C15.937,21.703 21.5,18.011 21.5,14.5 L21.5,3.872 L12,1.022 L2.5,3.872 Z M12.979,16.9987889 C12.873,16.9987889 12.769,16.9641714 12.682,16.8990091 C12.569,16.8145018 12.495,16.6841772 12.482,16.5416346 C12.456,16.2789491 12.248,16.0814259 12,16.0814259 C11.751,16.0814259 11.543,16.2789491 11.517,16.5426528 C11.503,16.6851953 11.43,16.8155199 11.317,16.9000273 C11.204,16.9845346 11.06,17.0191521 10.922,16.9896254 C9.75,16.752394 8.699,16.1272431 7.884,15.183408 C7.791,15.0775192 7.747,14.9359949 7.762,14.7954886 C7.776,14.6539643 7.847,14.525676 7.958,14.4401505 C8.165,14.2813174 8.226,14.0084503 8.103,13.791582 C7.98,13.5747137 7.718,13.4902063 7.48,13.5940588 C7.352,13.6490394 7.207,13.6470031 7.081,13.5899861 C6.954,13.5319509 6.856,13.4230077 6.811,13.2886105 C6.602,12.6614233 6.5,12.076999 6.5,11.5007199 C6.5,10.9244408 6.602,10.3400164 6.811,9.71282931 C6.856,9.57843207 6.954,9.46948885 7.08,9.41247183 C7.208,9.35443666 7.352,9.35240034 7.48,9.40839919 C7.719,9.51123344 7.98,9.42774425 8.102,9.21087597 C8.226,8.99095321 8.165,8.71910424 7.958,8.56027114 C7.847,8.47474562 7.775,8.34645734 7.762,8.20493298 C7.747,8.06442677 7.791,7.92392056 7.883,7.81701366 C8.699,6.87216032 9.75,6.24700951 10.922,6.01079618 C11.061,5.98228767 11.203,6.01486882 11.317,6.10039434 C11.43,6.18591986 11.504,6.3152263 11.517,6.45776883 C11.543,6.72045434 11.751,6.91797756 12,6.91797756 C12.248,6.91797756 12.456,6.72045434 12.482,6.45776883 C12.496,6.3152263 12.569,6.18591986 12.682,6.10039434 C12.795,6.01588698 12.937,5.98025135 13.077,6.01079618 C14.249,6.24700951 15.3,6.87216032 16.116,7.81701366 C16.208,7.9229024 16.252,8.06442677 16.237,8.20493298 C16.223,8.34645734 16.152,8.47474562 16.041,8.56027114 C15.834,8.71808608 15.773,8.99095321 15.896,9.20782149 C16.02,9.42570793 16.284,9.50817896 16.52,9.40636287 C16.648,9.35138218 16.791,9.35240034 16.92,9.41043551 C17.046,9.46847069 17.144,9.5774139 17.189,9.71079299 C17.398,10.3379801 17.5,10.9224045 17.5,11.4986836 C17.5,12.0719082 17.398,12.6563325 17.189,13.285556 C17.145,13.4199532 17.047,13.5288965 16.92,13.5869316 C16.792,13.6449668 16.648,13.645985 16.52,13.5910043 C16.283,13.48817 16.019,13.5716592 15.897,13.7885275 C15.896,13.7885275 15.896,13.7885275 15.896,13.7885275 C15.773,14.0053958 15.833,14.2782629 16.041,14.437096 C16.152,14.5216034 16.224,14.6509098 16.237,14.7924342 C16.252,14.9329404 16.208,15.0734466 16.115,15.1803535 C15.3,16.1252068 14.249,16.7503576 13.077,16.986571 C13.045,16.9967526 13.012,16.9987889 12.979,16.9987889 Z M8.938,14.8321425 C9.445,15.3208597 10.038,15.677216 10.685,15.87983 C10.936,15.3900946 11.433,15.063265 12,15.063265 C12.567,15.063265 13.063,15.3900946 13.313,15.87983 C13.96,15.6761979 14.553,15.3208597 15.06,14.8321425 C14.778,14.3678611 14.751,13.7722369 15.03,13.2825015 C15.309,12.791748 15.869,12.5280443 16.366,12.5341532 C16.456,12.1737243 16.5,11.8326404 16.5,11.5007199 C16.5,11.1677813 16.456,10.8266974 16.367,10.4672866 C15.83,10.4917224 15.309,10.21071 15.03,9.71893827 C14.752,9.22920287 14.778,8.63357873 15.06,8.16929734 C14.553,7.6805801 13.96,7.32422377 13.313,7.12160975 C13.063,7.60930883 12.567,7.93613849 12,7.93613849 C11.433,7.93613849 10.936,7.60930883 10.686,7.11957343 C10.039,7.32320561 9.446,7.67854378 8.939,8.16726102 C9.221,8.63256057 9.247,9.22716655 8.968,9.71893827 C8.69,10.2096918 8.168,10.4774682 7.633,10.4662684 C7.544,10.8256792 7.5,11.1667631 7.5,11.4997017 C7.5,11.8336585 7.544,12.1747424 7.633,12.5331351 C8.166,12.51379 8.69,12.7897116 8.969,13.2814834 C9.247,13.7722369 9.221,14.3678611 8.938,14.8321425 Z M12,14 C10.621,14 9.5,12.878 9.5,11.5 C9.5,10.122 10.621,9 12,9 C13.379,9 14.5,10.122 14.5,11.5 C14.5,12.878 13.379,14 12,14 Z M12,10 C11.173,10 10.5,10.673 10.5,11.5 C10.5,12.327 11.173,13 12,13 C12.827,13 13.5,12.327 13.5,11.5 C13.5,10.673 12.827,10 12,10 Z"
})));
SecuritySettings.displayName = "DecorativeIcon";

const Server = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M15.5614,4.3528 C15.8494,4.3528 16.0844,4.5878 16.0844,4.8758 L16.0844,6.4588 C16.0844,6.7478 15.8494,6.9818 15.5614,6.9818 C15.2734,6.9818 15.0384,6.7478 15.0384,6.4588 L15.0384,4.8758 C15.0384,4.5878 15.2734,4.3528 15.5614,4.3528 Z M3.9574,5.6677 C3.9574,5.5197 3.8374,5.3987 3.6884,5.3987 C3.5414,5.3987 3.4214,5.5197 3.4214,5.6677 C3.4214,5.8147 3.5414,5.9357 3.6884,5.9357 C3.8374,5.9357 3.9574,5.8147 3.9574,5.6677 Z M3.6884,4.3527 C4.4144,4.3527 5.0034,4.9427 5.0034,5.6677 C5.0034,6.3927 4.4144,6.9817 3.6884,6.9817 C2.9644,6.9817 2.3744,6.3927 2.3744,5.6677 C2.3744,4.9427 2.9644,4.3527 3.6884,4.3527 Z M13.1864,4.3528 C13.4744,4.3528 13.7104,4.5878 13.7104,4.8758 L13.7104,6.4588 C13.7104,6.7478 13.4744,6.9818 13.1864,6.9818 C12.8984,6.9818 12.6634,6.7478 12.6634,6.4588 L12.6634,4.8758 C12.6634,4.5878 12.8984,4.3528 13.1864,4.3528 Z M17.9364,4.3528 C18.2244,4.3528 18.4594,4.5878 18.4594,4.8758 L18.4594,6.4588 C18.4594,6.7478 18.2244,6.9818 17.9364,6.9818 C17.6484,6.9818 17.4124,6.7478 17.4124,6.4588 L17.4124,4.8758 C17.4124,4.5878 17.6484,4.3528 17.9364,4.3528 Z M15.5614,13.0588 C15.8494,13.0588 16.0844,13.2938 16.0844,13.5818 L16.0844,15.1638 C16.0844,15.4538 15.8494,15.6888 15.5614,15.6888 C15.2734,15.6888 15.0384,15.4538 15.0384,15.1638 L15.0384,13.5818 C15.0384,13.2938 15.2734,13.0588 15.5614,13.0588 Z M20.3104,13.0588 C20.5984,13.0588 20.8334,13.2938 20.8334,13.5818 L20.8334,15.1638 C20.8334,15.4538 20.5984,15.6888 20.3104,15.6888 C20.0224,15.6888 19.7874,15.4538 19.7874,15.1638 L19.7874,13.5818 C19.7874,13.2938 20.0224,13.0588 20.3104,13.0588 Z M17.9364,13.0588 C18.2244,13.0588 18.4594,13.2938 18.4594,13.5818 L18.4594,15.1638 C18.4594,15.4538 18.2244,15.6888 17.9364,15.6888 C17.6484,15.6888 17.4124,15.4538 17.4124,15.1638 L17.4124,13.5818 C17.4124,13.2938 17.6484,13.0588 17.9364,13.0588 Z M3.9574,14.3743 C3.9574,14.2273 3.8374,14.1053 3.6884,14.1053 C3.5414,14.1053 3.4214,14.2273 3.4214,14.3743 C3.4214,14.5213 3.5414,14.6423 3.6884,14.6423 C3.8374,14.6423 3.9574,14.5213 3.9574,14.3743 Z M3.6884,13.0593 C4.4144,13.0593 5.0034,13.6483 5.0034,14.3743 C5.0034,15.0993 4.4144,15.6883 3.6884,15.6883 C2.9644,15.6883 2.3744,15.0993 2.3744,14.3743 C2.3744,13.6483 2.9644,13.0593 3.6884,13.0593 Z M22.953,13.26 C22.953,12.417 22.266,11.732 21.424,11.732 L2.576,11.732 C1.732,11.732 1.047,12.417 1.047,13.26 L1.047,15.487 C1.047,16.329 1.732,17.016 2.576,17.016 L21.424,17.016 C22.266,17.016 22.953,16.329 22.953,15.487 L22.953,13.26 Z M22.953,6.78 L22.953,4.553 C22.953,3.71 22.266,3.025 21.424,3.025 L2.576,3.025 C1.732,3.025 1.047,3.71 1.047,4.553 L1.047,6.78 C1.047,7.623 1.732,8.309 2.576,8.309 L21.424,8.309 C22.266,8.309 22.953,7.623 22.953,6.78 Z M10.021,20.438 C9.732,20.438 9.497,20.202 9.497,19.914 L9.497,19.646 L8.961,19.646 L8.961,19.914 C8.961,20.202 8.726,20.438 8.438,20.438 L8.17,20.438 L8.17,20.973 L10.289,20.973 L10.289,20.438 L10.021,20.438 Z M21.424,10.685 C22.844,10.685 24,11.841 24,13.261 L24,15.487 C24,16.907 22.844,18.063 21.424,18.063 L9.753,18.063 L9.753,18.6 L10.021,18.6 C10.31,18.6 10.545,18.834 10.545,19.122 L10.545,19.391 L10.812,19.391 C11.101,19.391 11.336,19.626 11.336,19.914 L11.336,20.183 L16.353,20.183 C16.641,20.183 16.877,20.418 16.877,20.706 C16.877,20.994 16.641,21.229 16.353,21.229 L11.336,21.229 L11.336,21.497 C11.336,21.785 11.101,22.021 10.812,22.021 L7.646,22.021 C7.358,22.021 7.123,21.785 7.123,21.497 L7.123,21.229 L2.106,21.229 C1.817,21.229 1.583,20.994 1.583,20.706 C1.583,20.418 1.817,20.183 2.106,20.183 L7.123,20.183 L7.123,19.914 C7.123,19.626 7.358,19.391 7.646,19.391 L7.915,19.391 L7.915,19.122 C7.915,18.834 8.15,18.6 8.438,18.6 L8.706,18.6 L8.706,18.063 L2.576,18.063 C1.155,18.063 9.09494702e-13,16.907 9.09494702e-13,15.487 L9.09494702e-13,13.261 C9.09494702e-13,11.841 1.156,10.685 2.577,10.685 L8.706,10.685 L8.706,9.357 L2.576,9.357 C1.155,9.357 9.09494702e-13,8.201 9.09494702e-13,6.781 L9.09494702e-13,4.554 C9.09494702e-13,3.135 1.156,1.979 2.577,1.979 L21.424,1.979 C22.111,1.979 22.758,2.247 23.244,2.735 C23.731,3.222 24,3.868 23.999,4.554 L23.999,6.781 C23.999,8.201 22.844,9.357 21.424,9.357 L9.753,9.357 L9.753,10.685 L21.424,10.685 Z M20.3104,4.3528 C20.5984,4.3528 20.8334,4.5878 20.8334,4.8758 L20.8334,6.4588 C20.8334,6.7478 20.5984,6.9818 20.3104,6.9818 C20.0224,6.9818 19.7874,6.7478 19.7874,6.4588 L19.7874,4.8758 C19.7874,4.5878 20.0224,4.3528 20.3104,4.3528 Z M13.1864,13.0588 C13.4744,13.0588 13.7104,13.2938 13.7104,13.5818 L13.7104,15.1638 C13.7104,15.4538 13.4744,15.6888 13.1864,15.6888 C12.8984,15.6888 12.6634,15.4538 12.6634,15.1638 L12.6634,13.5818 C12.6634,13.2938 12.8984,13.0588 13.1864,13.0588 Z"
})));
Server.displayName = "DecorativeIcon";

const ServiceTruck = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -3)",
  d: "M2.06428755,17.9354624 C2.32085601,16.8282317 3.31520351,16 4.5,16 C5.70770586,16 6.71752643,16.8605709 6.94976408,18 L17.0502359,18 C17.2824736,16.8605709 18.2922941,16 19.5,16 C20.6847965,16 21.679144,16.8282317 21.9357125,17.9354624 C22.5509464,17.7483124 23,17.1755338 23,16.5 L23,13.781 C23,13.551 22.845,13.352 22.623,13.296 C21.721,13.071 20.897,12.605 20.241,11.948 L15.732,7.44 C15.453,7.16 15.066,7 14.672,7 C14.512,7 14.361,6.923 14.267,6.793 L12.395,4.207 C12.301,4.078 12.149,4 11.989,4 L1.5,4 C1.225,4 1,4.224 1,4.5 L1,16.5 C1,17.1755338 1.44905365,17.7483124 2.06428755,17.9354624 Z M2.04204686,18.9579722 C0.881158025,18.7422213 0,17.7217246 0,16.5 L0,4.5 C0,3.673 0.673,3 1.5,3 L11.989,3 C12.468,3 12.923,3.232 13.204,3.62 L14.937,6.014 C15.504,6.074 16.03,6.324 16.439,6.733 L20.948,11.241 C21.476,11.77 22.139,12.145 22.865,12.326 C23.533,12.493 24,13.091 24,13.781 L24,16.5 C24,17.7217246 23.118842,18.7422213 21.9579531,18.9579722 C21.7422545,20.1182011 20.7225106,21 19.5,21 C18.2922941,21 17.2824736,20.1394291 17.0502359,19 L6.94976408,19 C6.71752643,20.1394291 5.70770586,21 4.5,21 C3.27748944,21 2.25774547,20.1182011 2.04204686,18.9579722 Z M4.5,17 C3.673,17 3,17.673 3,18.5 C3,19.327 3.673,20 4.5,20 C5.327,20 6,19.327 6,18.5 C6,17.673 5.327,17 4.5,17 Z M19.5,17 C18.673,17 18,17.673 18,18.5 C18,19.327 18.673,20 19.5,20 C20.327,20 21,19.327 21,18.5 C21,17.673 20.327,17 19.5,17 Z M15.5,15 L14.5,15 C14.224,15 14,14.776 14,14.5 C14,14.224 14.224,14 14.5,14 L15.5,14 C15.776,14 16,14.224 16,14.5 C16,14.776 15.776,15 15.5,15 Z M18.5,13 L12.5,13 C12.224,13 12,12.776 12,12.5 L12,8.5 C12,8.224 12.224,8 12.5,8 C12.776,8 13,8.224 13,8.5 L13,12 L18.5,12 C18.776,12 19,12.224 19,12.5 C19,12.776 18.776,13 18.5,13 Z M9.5,10 L3.5,10 C3.224,10 3,9.776 3,9.5 C3,9.224 3.224,9 3.5,9 L9.5,9 C9.776,9 10,9.224 10,9.5 C10,9.776 9.776,10 9.5,10 Z M11.5,7 L3.5,7 C3.224,7 3,6.776 3,6.5 C3,6.224 3.224,6 3.5,6 L11.5,6 C11.776,6 12,6.224 12,6.5 C12,6.776 11.776,7 11.5,7 Z M9.5,13 L3.5,13 C3.224,13 3,12.776 3,12.5 C3,12.224 3.224,12 3.5,12 L9.5,12 C9.776,12 10,12.224 10,12.5 C10,12.776 9.776,13 9.5,13 Z"
})));
ServiceTruck.displayName = "DecorativeIcon";

const Settings = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M14.3008946,24 L9.70089462,24 C9.16189462,24 8.70589462,23.604 8.64089462,23.079 L8.24489462,20.319 C7.70389462,20.075 7.17989462,19.771 6.68189462,19.412 L4.07889462,20.457 C3.56289462,20.644 3.00089462,20.436 2.75189462,19.98 L0.457894623,16.011 C0.196894623,15.532 0.308894623,14.957 0.717894623,14.633 L2.92589462,12.906 C2.89289462,12.568 2.87589462,12.275 2.87589462,12 C2.87589462,11.725 2.89289462,11.432 2.92789462,11.094 L0.721894623,9.37 C0.301894623,9.038 0.190894623,8.444 0.461894623,7.986 L2.75889462,4.011 C3.00889462,3.553 3.57689462,3.347 4.07589462,3.542 L6.68589462,4.59 C7.20689462,4.218 7.72189462,3.919 8.24589462,3.682 L8.64289462,0.911 C8.70689462,0.396 9.16289462,0 9.70189462,0 L14.3018946,0 C14.8408946,0 15.2968946,0.396 15.3618946,0.921 L15.7578946,3.682 C16.2988946,3.925 16.8218946,4.229 17.3198946,4.589 L19.9228946,3.544 C20.4358946,3.355 20.9988946,3.564 21.2498946,4.021 L23.5438946,7.99 C23.8058946,8.469 23.6928946,9.044 23.2828946,9.368 L21.0748946,11.094 C21.1028946,11.36 21.1268946,11.671 21.1268946,12 C21.1268946,12.329 21.1038946,12.64 21.0748946,12.906 L23.2808946,14.631 C23.6928946,14.958 23.8048946,15.533 23.5498946,16.001 L21.2438946,19.99 C20.9938946,20.448 20.4238946,20.652 19.9268946,20.459 L17.3168946,19.411 C16.7958946,19.783 16.2808946,20.082 15.7568946,20.319 L15.3598946,23.089 C15.2958946,23.604 14.8398946,24 14.3008946,24 Z M6.75689462,18.343 C6.86489462,18.343 6.97289462,18.378 7.06189462,18.447 C7.63689462,18.889 8.25189462,19.246 8.89089462,19.508 C9.05489462,19.575 9.17089462,19.724 9.19689462,19.9 L9.63389462,22.947 L14.3008946,23 L14.8058946,19.899 C14.8308946,19.723 14.9478946,19.574 15.1118946,19.507 C15.7258946,19.256 16.3248946,18.907 16.9448946,18.443 C17.0848946,18.339 17.2688946,18.314 17.4308946,18.379 L20.2938946,19.529 L22.6758946,15.511 C22.6918946,15.483 22.6868946,15.438 22.6608946,15.417 L20.2368946,13.521 C20.0988946,13.413 20.0268946,13.239 20.0488946,13.065 C20.0868946,12.761 20.1258946,12.397 20.1258946,12 C20.1258946,11.604 20.0868946,11.239 20.0488946,10.935 C20.0268946,10.76 20.0988946,10.587 20.2368946,10.479 L22.6638946,8.582 C22.6878946,8.563 22.6918946,8.519 22.6708946,8.48 L20.3768946,4.511 L17.4318946,5.622 C17.2668946,5.689 17.0818946,5.663 16.9408946,5.555 C16.3648946,5.112 15.7498946,4.755 15.1118946,4.494 C14.9478946,4.427 14.8318946,4.278 14.8058946,4.102 L14.3698946,1.054 L9.70189462,1 L9.19589462,4.102 C9.17089462,4.277 9.05489462,4.426 8.89089462,4.494 C8.27689462,4.745 7.67689462,5.093 7.05789462,5.558 C6.91689462,5.663 6.73389462,5.688 6.57089462,5.622 L3.70789462,4.472 L1.32589462,8.49 L3.76489462,10.479 C3.90289462,10.587 3.97489462,10.76 3.95289462,10.935 C3.90089462,11.355 3.87589462,11.693 3.87589462,12 C3.87589462,12.307 3.89989462,12.646 3.95289462,13.065 C3.97489462,13.239 3.90289462,13.413 3.76489462,13.521 L1.33789462,15.418 C1.31389462,15.437 1.30989462,15.482 1.33089462,15.521 L3.62489462,19.49 L6.56989462,18.379 C6.63089462,18.354 6.69389462,18.343 6.75689462,18.343 Z M12.0008946,17 C9.24389462,17 7.00089462,14.757 7.00089462,12 C7.00089462,9.243 9.24389462,7 12.0008946,7 C14.7578946,7 17.0008946,9.243 17.0008946,12 C17.0008946,14.757 14.7578946,17 12.0008946,17 Z M12.0008946,8 C9.79489462,8 8.00089462,9.794 8.00089462,12 C8.00089462,14.206 9.79489462,16 12.0008946,16 C14.2068946,16 16.0008946,14.206 16.0008946,12 C16.0008946,9.794 14.2068946,8 12.0008946,8 Z"
})));
Settings.displayName = "DecorativeIcon";

const SharedAccount = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "18",
  viewBox: "0 0 24 18"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -3)",
  d: "M20.755,16.341 L17.999,15.653 L17.796,14.836 C18.525,14.09 19.029,13.09 19.197,12.058 C19.627,11.904 19.952,11.519 20.011,11.044 L20.196,9.566 C20.24,9.217 20.131,8.864 19.9,8.599 C19.787,8.469 19.648,8.365 19.495,8.293 L19.556,7.043 L19.799,6.799 C20.249,6.321 20.622,5.506 19.854,4.335 C19.273,3.449 18.296,3 16.945,3 C16.406,3 15.145,3 13.984,3.824 C13.759,3.984 13.706,4.296 13.866,4.521 C14.025,4.746 14.339,4.798 14.562,4.639 C15.357,4.075 16.213,3.999 16.946,3.999 C17.938,3.999 18.634,4.296 19.018,4.882 C19.456,5.551 19.291,5.88 19.082,6.102 L18.713,6.472 C18.625,6.56 18.573,6.677 18.567,6.801 L18.477,8.651 C18.47,8.787 18.519,8.919 18.612,9.018 C18.705,9.117 18.834,9.174 18.97,9.175 C19.064,9.176 19.122,9.227 19.148,9.257 C19.175,9.287 19.217,9.351 19.205,9.443 L19.02,10.922 C19.006,11.041 18.903,11.131 18.747,11.131 C18.486,11.131 18.27,11.332 18.249,11.592 C18.168,12.61 17.667,13.624 16.907,14.305 C16.77,14.428 16.711,14.618 16.756,14.798 L17.103,16.187 C17.148,16.366 17.287,16.507 17.467,16.551 L20.514,17.312 C21.814,17.637 22.766,18.707 22.963,20 L19.5,19.998 L19.5,21 L23.499,20.997 C23.775,20.997 23.999,20.773 23.999,20.497 C24,18.528 22.666,16.819 20.755,16.341 Z M14.755,16.341 L11.999,15.653 L11.889,15.21 C13.776,14.873 14.754,14.303 14.799,14.277 C14.939,14.194 15.027,14.044 15.039,13.881 C15.051,13.718 14.979,13.556 14.851,13.453 C14.838,13.443 13.566,12.371 13.566,8.674 C13.566,5.399 12.776,3.739 11.218,3.739 L11.052,3.739 C10.523,3.238 10.084,3 9,3 C7.57,3 4.435,4.429 4.435,8.674 C4.435,12.371 3.163,13.443 3.157,13.448 C3.024,13.547 2.949,13.707 2.958,13.873 C2.966,14.039 3.056,14.19 3.199,14.276 C3.243,14.303 4.213,14.876 6.112,15.213 L6.002,15.653 L3.246,16.342 C1.334,16.819 0,18.529 0,20.5 C0,20.633 0.052,20.761 0.146,20.854 C0.24,20.947 0.367,21 0.5,21 L17.5,20.997 C17.776,20.997 18,20.773 18,20.497 C18,18.528 16.666,16.819 14.755,16.341 Z M1.039,19.998 C1.236,18.706 2.189,17.637 3.489,17.311 L6.536,16.55 C6.715,16.505 6.855,16.365 6.9,16.186 L7.215,14.925 C7.249,14.787 7.224,14.642 7.144,14.524 C7.065,14.407 6.939,14.329 6.798,14.309 C5.62,14.145 4.775,13.874 4.271,13.674 C4.768,12.954 5.436,11.466 5.436,8.674 C5.435,4.832 8.294,4 9,4 C9.863,4 10.034,4.133 10.494,4.593 C10.588,4.686 10.715,4.739 10.848,4.739 L11.218,4.739 C12.075,4.739 12.566,6.174 12.566,8.674 C12.566,11.464 13.233,12.952 13.73,13.673 C13.223,13.873 12.377,14.143 11.203,14.308 C11.062,14.327 10.937,14.406 10.858,14.523 C10.778,14.641 10.753,14.786 10.787,14.924 L11.102,16.187 C11.147,16.366 11.286,16.507 11.466,16.551 L14.513,17.312 C15.813,17.637 16.765,18.707 16.962,20 L1.039,19.998 Z"
})));
SharedAccount.displayName = "DecorativeIcon";

const Shop = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M5.792,16.6245 L11.084,16.6245 L11.084,13.7075 L5.792,13.7075 L5.792,16.6245 Z M11.604,12.6665 C11.891,12.6665 12.125,12.8995 12.125,13.1865 L12.125,17.1455 C12.125,17.4325 11.891,17.6665 11.604,17.6665 L5.271,17.6665 C4.984,17.6665 4.75,17.4325 4.75,17.1455 L4.75,13.1865 C4.75,12.8995 4.984,12.6665 5.271,12.6665 L11.604,12.6665 Z M12.521,6.333 L17.121,6.333 L15.663,3.416 L12.521,3.416 L12.521,6.333 Z M22.92,7.375 L18.458,7.375 L18.458,9.525 C18.935,9.815 19.462,9.969 19.985,9.969 C21.473,9.969 22.736,8.84 22.92,7.375 Z M1.471,6.333 L5.714,6.333 L7.173,3.416 L3.768,3.416 L1.471,6.333 Z M17.417,9.721 L17.417,7.375 L12.521,7.375 L12.521,9.647 C13.074,10.482 13.996,10.979 14.994,10.979 C15.957,10.979 16.859,10.509 17.417,9.721 Z M18.285,6.333 L22.469,6.333 L20.229,3.416 L16.827,3.416 L18.285,6.333 Z M6.584,9.723 C7.143,10.511 8.045,10.98 9.005,10.98 C10.004,10.98 10.926,10.483 11.479,9.648 L11.479,7.375 L6.584,7.375 L6.584,9.723 Z M18.729,12.666 C19.017,12.666 19.25,12.9 19.25,13.187 L19.25,20.583 L19.792,20.583 L19.792,11 C19.209,10.971 18.646,10.812 18.113,10.526 C17.349,11.478 16.217,12.021 14.994,12.021 C13.851,12.021 12.769,11.533 12.002,10.676 C11.242,11.533 10.159,12.021 9.006,12.021 C7.783,12.021 6.65,11.478 5.885,10.526 C5.354,10.812 4.791,10.971 4.208,11 L4.208,20.583 L12.667,20.583 L12.667,13.187 C12.667,12.9 12.9,12.666 13.188,12.666 L18.729,12.666 Z M6.879,6.333 L11.479,6.333 L11.479,3.416 L8.337,3.416 L6.879,6.333 Z M5.542,7.375 L1.08,7.375 C1.264,8.839 2.528,9.968 4.015,9.968 C4.539,9.968 5.065,9.815 5.542,9.525 L5.542,7.375 Z M13.708,20.583 L18.208,20.583 L18.208,13.708 L13.708,13.708 L13.708,20.583 Z M23.996,6.818 L24,6.854 L24,7.009 C24,8.892 22.675,10.518 20.833,10.914 L20.833,21.104 C20.833,21.391 20.6,21.625 20.313,21.625 L3.688,21.625 C3.4,21.625 3.167,21.391 3.167,21.104 L3.167,10.914 C1.325,10.518 0,8.892 0,7.009 L0,6.854 C0,6.823 0.006,6.798 0.011,6.779 C-0.012,6.633 0.023,6.488 0.111,6.377 L3.106,2.574 C3.203,2.449 3.356,2.375 3.515,2.375 L20.485,2.375 C20.646,2.375 20.801,2.451 20.898,2.578 L23.893,6.476 C23.966,6.572 24.003,6.693 23.996,6.818 Z"
})));
Shop.displayName = "DecorativeIcon";

const Signal = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M4,18.7826087 L1,18.7826087 C0.224,18.7826087 0,19.0163478 0,19.826087 L0,24 C0,23.7662609 0.224,24 1,24 L4,24 C3.776,24 4,23.7662609 4,24 L4,19.826087 C4,19.0163478 3.776,18.7826087 4,18.7826087 Z M3,22.9565217 L1,22.9565217 L1,19.826087 L3,19.826087 L3,22.9565217 Z M24,0 L21,0 C20.224,0 20,0.23373913 20,1.04347826 L20,24 C20,23.7662609 20.224,24 21,24 L24,24 C23.776,24 24,23.7662609 24,24 L24,1.04347826 C24,0.23373913 23.776,0 24,0 Z M23,22.9565217 L21,22.9565217 L21,1.04347826 L23,1.04347826 L23,22.9565217 Z M9,14.6086957 L6,14.6086957 C5.224,14.6086957 5,14.8424348 5,14.6086957 L5,22.9565217 C5,23.7662609 5.224,24 6,24 L9,24 C8.776,24 9,23.7662609 9,22.9565217 L9,14.6086957 C9,14.8424348 8.776,14.6086957 9,14.6086957 Z M8,22.9565217 L6,22.9565217 L6,15.6521739 L8,15.6521739 L8,22.9565217 Z M19,4.17391304 L16,4.17391304 C15.224,4.17391304 15,4.40765217 15,5.2173913 L15,24 C15,23.7662609 15.224,24 16,24 L19,24 C18.776,24 19,23.7662609 19,24 L19,5.2173913 C19,4.40765217 18.776,4.17391304 19,4.17391304 Z M18,22.9565217 L16,22.9565217 L16,5.2173913 L18,5.2173913 L18,22.9565217 Z M14,9.39130435 L11,9.39130435 C10.224,9.39130435 10,9.62504348 10,10.4347826 L10,24 C10,23.7662609 10.224,24 11,24 L14,24 C13.776,24 14,23.7662609 14,24 L14,10.4347826 C14,9.62504348 13.776,9.39130435 14,9.39130435 Z M13,22.9565217 L11,22.9565217 L11,10.4347826 L13,10.4347826 L13,22.9565217 Z"
})));
Signal.displayName = "DecorativeIcon";

const SignPost = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M11.3441248,11.8965 L13.5121248,11.8965 L13.5121248,9.7285 L11.3441248,9.7285 L11.3441248,11.8965 Z M19.8481248,13.1875 L19.8481248,17.1485 C19.8481248,17.3095 19.7171248,17.4405 19.5561248,17.4405 L6.35412481,17.4405 C6.27712481,17.4405 6.20312481,17.4095 6.14812481,17.3545 L4.16712481,15.3735 C4.11212481,15.3185 4.08212481,15.2455 4.08212481,15.1685 C4.08212481,15.0905 4.11212481,15.0175 4.16812481,14.9625 L6.14912481,12.9805 C6.20312481,12.9265 6.27712481,12.8965 6.35412481,12.8965 L6.35412481,12.8965 L19.5561248,12.8965 C19.7171248,12.8965 19.8481248,13.0265 19.8481248,13.1875 L19.8481248,13.1875 Z M13.5121248,22.6925 C13.5121248,22.8505 13.3791248,22.9845 13.2201248,22.9845 L11.6361248,22.9845 C11.4781248,22.9845 11.3441248,22.8505 11.3441248,22.6925 L11.3441248,18.4405 L13.5121248,18.4405 L13.5121248,22.6925 Z M1.84012481,8.4365 L1.84012481,3.6835 C1.84012481,3.5225 1.97112481,3.3915 2.13212481,3.3915 L19.4921248,3.3915 C19.5691248,3.3915 19.6441248,3.4225 19.6991248,3.4775 L22.0751248,5.8535 C22.1881248,5.9675 22.1881248,6.1525 22.0751248,6.2665 L19.6981248,8.6425 C19.6431248,8.6975 19.5701248,8.7285 19.4921248,8.7285 L2.13212481,8.7285 C1.97112481,8.7285 1.84012481,8.5975 1.84012481,8.4365 L1.84012481,8.4365 Z M11.3441248,1.3075 C11.3441248,1.1495 11.4781248,1.0155 11.6361248,1.0155 L13.2201248,1.0155 C13.3791248,1.0155 13.5121248,1.1495 13.5121248,1.3075 L13.5121248,2.3915 L11.3441248,2.3915 L11.3441248,1.3075 Z M19.4921248,9.7285 C19.8381248,9.7285 20.1631248,9.5935 20.4061248,9.3495 L22.7831248,6.9725 C23.2861248,6.4685 23.2851248,5.6505 22.7821248,5.1465 L20.4071248,2.7715 C20.1671248,2.5295 19.8331248,2.3915 19.4921248,2.3915 L14.5121248,2.3915 L14.5121248,1.3075 C14.5121248,0.5955 13.9331248,0.0155 13.2201248,0.0155 L11.6361248,0.0155 C10.9241248,0.0155 10.3441248,0.5955 10.3441248,1.3075 L10.3441248,2.3915 L2.13212481,2.3915 C1.42012481,2.3915 0.840124814,2.9715 0.840124814,3.6835 L0.840124814,8.4365 C0.840124814,9.1485 1.42012481,9.7285 2.13212481,9.7285 L10.3441248,9.7285 L10.3441248,11.8965 L6.35512481,11.8965 L6.35212481,11.8965 C6.01212481,11.8965 5.68012481,12.0345 5.44112481,12.2745 L3.46212481,14.2545 C3.21712481,14.4985 3.08212481,14.8225 3.08212481,15.1675 C3.08212481,15.5125 3.21712481,15.8375 3.46112481,16.0815 L5.44112481,18.0605 C5.68112481,18.3015 6.01412481,18.4405 6.35412481,18.4405 L10.3441248,18.4405 L10.3441248,22.6925 C10.3441248,23.4055 10.9241248,23.9845 11.6361248,23.9845 L13.2201248,23.9845 C13.9331248,23.9845 14.5121248,23.4055 14.5121248,22.6925 L14.5121248,18.4405 L19.5561248,18.4405 C20.2691248,18.4405 20.8481248,17.8615 20.8481248,17.1485 L20.8481248,13.1875 C20.8481248,12.4755 20.2691248,11.8965 19.5561248,11.8965 L14.5121248,11.8965 L14.5121248,9.7285 L19.4921248,9.7285 Z"
})));
SignPost.displayName = "DecorativeIcon";

const SimCard = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M13.5,15 L10.5,15 L10.5,17.5 C10.5,17.776 10.276,18 10,18 C9.724,18 9.5,17.776 9.5,17.5 L9.5,15 L7.5,15 L7.5,19.5 C7.5,19.776 7.724,20 8,20 L11.5,20 L11.5,17.5 C11.5,17.224 11.724,17 12,17 C12.276,17 12.5,17.224 12.5,17.5 L12.5,20 L16,20 C16.276,20 16.5,19.776 16.5,19.5 L16.5,15 L14.5,15 L14.5,17.5 C14.5,17.776 14.276,18 14,18 C13.724,18 13.5,17.776 13.5,17.5 L13.5,15 Z M14.5,9 L14.5,11.5 C14.5,11.776 14.276,12 14,12 C13.724,12 13.5,11.776 13.5,11.5 L13.5,9 L10.5,9 L10.5,11.5 C10.5,11.776 10.276,12 10,12 C9.724,12 9.5,11.776 9.5,11.5 L9.5,9 L8,9 C7.724,9 7.5,9.224 7.5,9.5 L7.5,14 L11.5,14 L11.5,11.5 C11.5,11.224 11.724,11 12,11 C12.276,11 12.5,11.224 12.5,11.5 L12.5,14 L16.5,14 L16.5,9.5 C16.5,9.224 16.276,9 16,9 L14.5,9 Z M18,24 L6,24 C4.622,24 3.5,22.878 3.5,21.5 L3.5,5.5 C3.5,5.367 3.553,5.24 3.646,5.146 L8.646,0.146 C8.74,0.053 8.867,0 9,0 L18,0 C19.378,0 20.5,1.122 20.5,2.5 L20.5,21.5 C20.5,22.878 19.378,24 18,24 Z M4.5,5.707 L4.5,21.5 C4.5,22.327 5.173,23 6,23 L18,23 C18.827,23 19.5,22.327 19.5,21.5 L19.5,2.5 C19.5,1.673 18.827,1 18,1 L9.207,1 L4.5,5.707 Z M16,21 L8,21 C7.173,21 6.5,20.327 6.5,19.5 L6.5,9.5 C6.5,8.673 7.173,8 8,8 L16,8 C16.827,8 17.5,8.673 17.5,9.5 L17.5,19.5 C17.5,20.327 16.827,21 16,21 Z"
})));
SimCard.displayName = "DecorativeIcon";

const Soccer = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M9 2.75v-1.334c-2.235.634-4.182 1.959-5.596 3.728l1.967.328 3.629-2.722zm1-.04l3.11 1.777 4.39-.439v-1.548l.001-.023c-1.619-.939-3.498-1.477-5.501-1.477-.683 0-1.351.063-2 .182v1.528zm-4.851 3.738l-2.396-.399c-1.108 1.717-1.752 3.76-1.752 5.951 0 .502.034.996.099 1.481l3.1-.443 2.239-3.582-1.289-3.008zm-3.118-1.121c.03-.081.079-.152.142-.206 2.173-3.094 5.768-5.121 9.828-5.121 6.617 0 12 5.383 12 12s-5.383 12-12 12-12-5.383-12-12c0-2.468.749-4.764 2.031-6.673zm5.267 4.64l-2.218 3.548 2.199 3.958 4.85-.441 1.314-3.941-2.669-3.559-3.476.434zm6.026-4.496l-1.738 3.477 2.646 3.528 4.41-.441 1.304-3.477-2.205-3.528-4.416.442zm6.185 7.097l.443 4.432h1.845c.769-1.501 1.204-3.201 1.204-5 0-.877-.103-1.731-.298-2.55l-1.883-.377-1.31 3.494zm.136 5.432l-3.69 2.307-.348 2.086c2.319-.807 4.287-2.37 5.609-4.393h-1.571zm-4.686 2.2l-2.62-2.183-5.017.456-1.359 2.719c1.734 1.143 3.81 1.809 6.037 1.809.875 0 1.726-.103 2.542-.296l.417-2.504zm7.424-11.833c-.742-2.113-2.111-3.933-3.883-5.236v1.225l2.31 3.696 1.573.315zm-17.24 12.229l1.292-2.584-2.205-3.969-2.952.422c.565 2.459 1.956 4.605 3.865 6.13zm.971-14.432l1.197 2.793 3.361-.42 1.669-3.338-2.804-1.602-3.423 2.567zm6.968 11.17l2.46 2.05 3.43-2.144-.419-4.193-4.18.418-1.291 3.869z"
})));
Soccer.displayName = "DecorativeIcon";

const Speaker = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M19.862,21.931 L19.862,2.069 C19.862,1.458 19.364,0.96 18.753,0.96 L5.246,0.96 C4.635,0.96 4.138,1.458 4.138,2.069 L4.138,21.931 C4.138,22.542 4.635,23.04 5.246,23.04 L18.753,23.04 C19.364,23.04 19.862,22.542 19.862,21.931 Z M18.753,-3.01980663e-14 C19.893,-3.01980663e-14 20.822,0.929 20.822,2.069 L20.822,21.931 C20.822,23.073 19.893,24 18.753,24 L5.246,24 C4.106,24 3.178,23.073 3.178,21.931 L3.178,2.069 C3.178,0.929 4.106,-3.01980663e-14 5.246,-3.01980663e-14 L18.753,-3.01980663e-14 Z M15.3122,19.2845 C17.1382,17.4585 17.1382,14.4865 15.3122,12.6605 C14.3992,11.7475 13.1992,11.2905 11.9992,11.2905 C10.8002,11.2905 9.6012,11.7475 8.6872,12.6605 C6.8612,14.4865 6.8612,17.4585 8.6872,19.2845 C10.5142,21.1105 13.4872,21.1115 15.3122,19.2845 Z M11.9992,10.3285 C13.5072,10.3285 14.9242,10.9155 15.9912,11.9815 C17.0562,13.0475 17.6432,14.4655 17.6432,15.9725 C17.6432,17.4795 17.0562,18.8975 15.9912,19.9635 C14.9242,21.0295 13.5072,21.6165 11.9992,21.6165 C10.4922,21.6165 9.0752,21.0295 8.0092,19.9635 C6.9432,18.8975 6.3562,17.4795 6.3562,15.9725 C6.3562,14.4655 6.9432,13.0475 8.0092,11.9815 C9.0752,10.9155 10.4922,10.3285 11.9992,10.3285 Z M12.5031,16.4759 C12.7801,16.1989 12.7801,15.7469 12.5031,15.4689 C12.3641,15.3299 12.1821,15.2609 12.0001,15.2609 C11.8171,15.2609 11.6351,15.3299 11.4961,15.4689 C11.2191,15.7469 11.2191,16.1989 11.4961,16.4759 C11.7741,16.7529 12.2261,16.7529 12.5031,16.4759 Z M10.8171,14.7899 C11.4691,14.1389 12.5311,14.1389 13.1821,14.7899 C13.8341,15.4429 13.8341,16.5029 13.1821,17.1549 C12.8561,17.4799 12.4271,17.6429 12.0001,17.6429 C11.5721,17.6429 11.1441,17.4799 10.8171,17.1549 C10.1661,16.5029 10.1661,15.4429 10.8171,14.7899 Z M10.654,3.9012 C9.912,4.6432 9.912,5.8512 10.654,6.5932 C11.396,7.3352 12.603,7.3352 13.346,6.5932 C14.089,5.8512 14.089,4.6432 13.346,3.9012 C12.986,3.5422 12.508,3.3432 12,3.3432 C11.491,3.3432 11.013,3.5422 10.654,3.9012 Z M12,8.1092 C11.267,8.1092 10.533,7.8302 9.975,7.2722 C8.859,6.1552 8.859,4.3392 9.975,3.2222 C11.056,2.1402 12.943,2.1402 14.025,3.2222 C15.141,4.3392 15.141,6.1552 14.025,7.2722 C13.466,7.8302 12.733,8.1092 12,8.1092 Z"
})));
Speaker.displayName = "DecorativeIcon";

const SpeakerPhone = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "22",
  viewBox: "0 0 24 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -1)",
  d: "M7.673,15.7405 C7.804,15.7405 7.92,15.7495 8.049,15.7505 L8.481,18.7705 C8.495,18.8665 8.53,18.9545 8.585,19.0315 L10.425,21.6325 L7.393,21.6325 C7.201,21.6325 7.036,21.4895 7.008,21.2995 L6.214,15.7405 L7.673,15.7405 Z M4.133,7.0885 L7.079,7.0885 L7.079,14.5535 L5.529,14.5535 L4.133,14.5535 C2.509,14.5535 1.188,13.2315 1.188,11.6075 L1.188,10.0335 C1.188,8.4095 2.509,7.0885 4.133,7.0885 L4.133,7.0885 Z M8.679,14.5745 C8.641,14.5665 8.604,14.5535 8.563,14.5535 L8.267,14.5535 L8.267,7.0755 C18.025,6.9405 21.562,3.5915 22.487,2.4295 C22.684,2.5275 22.811,2.7295 22.811,2.9545 L22.811,18.6855 C22.811,18.9105 22.684,19.1135 22.487,19.2105 C21.575,18.0655 18.123,14.7975 8.679,14.5745 L8.679,14.5745 Z M22.226,1.1795 C22.019,1.1795 21.823,1.2915 21.715,1.4705 C21.687,1.5145 18.871,5.9005 7.673,5.9005 L4.133,5.9005 C1.854,5.9005 1.13686838e-13,7.7545 1.13686838e-13,10.0335 L1.13686838e-13,11.6075 C1.13686838e-13,13.8865 1.854,15.7405 4.133,15.7405 L5.014,15.7405 L5.832,21.4665 C5.943,22.2385 6.614,22.8205 7.393,22.8205 L10.642,22.8205 C10.868,22.8205 11.086,22.7515 11.273,22.6185 C11.758,22.2695 11.872,21.5915 11.525,21.1035 L9.636,18.4595 L9.254,15.7795 C19.091,16.1725 21.689,20.1265 21.714,20.1665 C21.819,20.3465 22.016,20.4605 22.226,20.4605 C23.204,20.4605 24,19.6645 24,18.6855 L24,2.9545 C24,1.9755 23.204,1.1795 22.226,1.1795 L22.226,1.1795 Z"
})));
SpeakerPhone.displayName = "DecorativeIcon";

const Speed = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M19.7435402,19.7440299 C15.4740144,24.0135557 8.52638557,24.0135557 4.2558701,19.7440299 C3.40077732,18.8889371 2.72481856,17.922999 2.21215876,16.8957 L7.73760206,16.8957 C8.63426186,16.8957 9.44580825,16.3394938 9.76349897,15.4903392 C10.0802,14.5362773 10.9798289,13.8959474 12.0002,13.8959474 C12.5336433,13.8959474 13.0344268,14.0721124 13.4372309,14.3779268 C13.4590041,14.3997 13.4837464,14.4185041 13.5094784,14.4363186 C13.8410247,14.7094732 14.099334,15.0766485 14.2438289,15.510133 C14.5555814,16.3394938 15.3661381,16.8957 16.2627979,16.8957 L21.7872515,16.8957 C21.2745918,17.922999 20.598633,18.8889371 19.7435402,19.7440299 M19.6980144,9.36910206 C19.5099732,9.12761753 19.1625918,9.08704021 18.9211072,9.27409175 L13.798468,13.2843186 C13.2689835,12.9666278 12.6504268,12.7884835 12.0002,12.7884835 C10.5018082,12.7884835 9.18057113,13.7336381 8.71838557,15.1211845 C8.57092165,15.5140918 8.16811753,15.7882361 7.73760206,15.7882361 L1.73710722,15.7882361 C1.35310722,14.7431227 1.13537526,13.6534732 1.07995258,12.5539268 L3.71154021,12.5539268 C4.01735464,12.5539268 4.26477732,12.3055144 4.26477732,11.9997 C4.26477732,11.6938856 4.01735464,11.4464629 3.71154021,11.4464629 L1.07995258,11.4464629 C1.20267423,9.00291649 2.13694227,6.59994742 3.88374639,4.66807113 L5.76613814,6.55046289 C5.87500412,6.65833918 6.0165299,6.71277216 6.15805567,6.71277216 C6.30057113,6.71277216 6.44209691,6.65833918 6.5499732,6.55046289 C6.76671546,6.33372062 6.76671546,5.9833701 6.5499732,5.76662784 L4.66758144,3.88423608 C6.60044742,2.13743196 9.0024268,1.20316392 11.4459732,1.08044227 L11.4459732,3.71104021 C11.4459732,4.01685464 11.6943856,4.26526701 12.0002,4.26526701 C12.3060144,4.26526701 12.5534371,4.01685464 12.5534371,3.71104021 L12.5534371,1.08044227 C14.9969835,1.20316392 17.3999526,2.13743196 19.3318289,3.88522577 L17.5296021,5.68745258 C17.3128598,5.90419485 17.3128598,6.25553505 17.5296021,6.47128763 C17.6374784,6.58015361 17.7790041,6.63359691 17.9205299,6.63359691 C18.0630454,6.63359691 18.2035814,6.58015361 18.3124474,6.47128763 L20.1156639,4.66807113 C21.862468,6.59994742 22.7967361,9.00291649 22.9194577,11.4464629 L20.2888598,11.4464629 C19.9820557,11.4464629 19.734633,11.6938856 19.734633,11.9997 C19.734633,12.3055144 19.9820557,12.5539268 20.2888598,12.5539268 L22.9194577,12.5539268 C22.8640351,13.6534732 22.6463031,14.7431227 22.2623031,15.7882361 L16.2627979,15.7882361 C15.8322825,15.7882361 15.4294784,15.5140918 15.2889423,15.1399887 C15.1484062,14.7203598 14.9336433,14.3422979 14.6585093,14.0176794 L19.6030041,10.146999 C19.8454784,9.95796804 19.8880351,9.6105866 19.6980144,9.36910206 M23.9230041,12.2659268 C23.9675402,12.1857619 24.0002,12.0986691 24.0002,11.9997 C24.0002,11.9017206 23.9675402,11.8136381 23.9230041,11.7334732 C23.8566948,8.76539072 22.7037052,5.81809175 20.4442412,3.55862784 C20.4442412,3.55763814 20.4442412,3.55664845 20.4432515,3.55664845 C20.4422619,3.55565876 20.4422619,3.55565876 20.4412722,3.55466907 C18.1808186,1.29619485 15.2335196,0.143205155 12.2664268,0.077885567 C12.1862619,0.0323597938 12.0981794,-0.0003 12.0002,-0.0003 C11.9012309,-0.0003 11.8141381,0.0323597938 11.7339732,0.077885567 C8.76490103,0.143205155 5.81661237,1.29619485 3.55615876,3.55664845 C1.29570515,5.81710206 0.142715464,8.76539072 0.0773958763,11.7344629 C0.0318701031,11.8146278 0.0002,11.9017206 0.0002,11.9997 C0.0002,12.0976794 0.0318701031,12.1857619 0.0773958763,12.2649371 C0.107086598,13.6425866 0.371334021,15.0133082 0.874096907,16.3137619 C0.874096907,16.3236588 0.868158763,16.332566 0.868158763,16.3414732 C0.868158763,16.5067515 0.942385567,16.649267 1.05521031,16.7512052 C1.63516907,18.0912464 2.46255052,19.350133 3.55615876,20.4437412 C5.88391134,22.7724835 8.94205567,23.9353701 12.0002,23.9353701 C15.0583443,23.9353701 18.1145093,22.7724835 20.4432515,20.4437412 C21.5368598,19.350133 22.3632515,18.0922361 22.9432103,16.7521948 C23.0580144,16.6502567 23.1322412,16.5067515 23.1322412,16.3414732 C23.1322412,16.3315763 23.1263031,16.3226691 23.1263031,16.3117825 C23.6280763,15.0123186 23.891334,13.6415969 23.9230041,12.2659268"
})));
Speed.displayName = "DecorativeIcon";

const SpeedReduced = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4.257 19.744c4.27 4.27 11.217 4.27 15.488 0a10.89 10.89 0 0 0 2.043-2.848h-5.525a2.164 2.164 0 0 1-2.026-1.406A2.344 2.344 0 0 0 12 13.896c-.533 0-1.034.176-1.437.482a2.349 2.349 0 0 0-.807 1.132 2.16 2.16 0 0 1-2.018 1.386H2.213a10.89 10.89 0 0 0 2.044 2.848zm.045-10.375a.554.554 0 0 1 .777-.095l5.123 4.01A3.49 3.49 0 0 1 12 12.788c1.499 0 2.82.946 3.282 2.333.147.393.55.667.98.667h6.001c.384-1.045.602-2.135.657-3.234H20.29a.554.554 0 0 1 0-1.108h2.631a10.89 10.89 0 0 0-2.803-6.778L18.234 6.55a.556.556 0 0 1-.784 0 .554.554 0 0 1 0-.783l1.883-1.883a10.891 10.891 0 0 0-6.779-2.804v2.631a.555.555 0 0 1-1.107 0v-2.63a10.885 10.885 0 0 0-6.778 2.804L6.47 5.687a.554.554 0 1 1-.783.784L3.885 4.668a10.89 10.89 0 0 0-2.804 6.778h2.63a.553.553 0 1 1 0 1.108h-2.63c.055 1.1.273 2.19.657 3.234h6c.43 0 .833-.274.973-.648a3.4 3.4 0 0 1 .63-1.122l-4.944-3.871a.552.552 0 0 1-.095-.778zM.077 12.266A.542.542 0 0 1 0 12c0-.098.033-.186.077-.267a11.889 11.889 0 0 1 3.48-8.174v-.002l.002-.002A11.89 11.89 0 0 1 11.734.078.536.536 0 0 1 12 0c.1 0 .186.032.266.078a11.887 11.887 0 0 1 8.178 3.479 11.887 11.887 0 0 1 3.479 8.177c.046.08.077.168.077.266a.529.529 0 0 1-.077.265 11.937 11.937 0 0 1-.797 4.049c0 .01.006.019.006.027a.548.548 0 0 1-.187.41 11.87 11.87 0 0 1-2.5 3.693A11.9 11.9 0 0 1 12 23.935a11.9 11.9 0 0 1-8.443-3.491 11.862 11.862 0 0 1-2.5-3.692.545.545 0 0 1-.189-.41c0-.01.006-.02.006-.03-.502-1.3-.765-2.67-.797-4.046z",
  fillRule: "evenodd"
})));
SpeedReduced.displayName = "DecorativeIcon";

const Success = props => {
  return /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 22 22"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    transform: "translate(-1 -1)",
    d: "M12,23 C5.93469565,23 1,18.0653043 1,12 C1,5.93469565 5.93469565,1 12,1 C18.0653043,1 23,5.93469565 23,12 C23,18.0653043 18.0653043,23 12,23 Z M12,1.95652174 C6.46173913,1.95652174 1.95652174,6.46173913 1.95652174,12 C1.95652174,17.5382609 6.46173913,22.0434783 12,22.0434783 C17.5382609,22.0434783 22.0434783,17.5382609 22.0434783,12 C22.0434783,6.46173913 17.5382609,1.95652174 12,1.95652174 Z M10.5652174,16.7826087 C10.4427826,16.7826087 10.3203478,16.7357391 10.2266087,16.6429565 L5.444,11.8603478 C5.25747826,11.6738261 5.25747826,11.3706087 5.444,11.184087 C5.63052174,10.9975652 5.93373913,10.9975652 6.12026087,11.184087 L10.5652174,15.628087 L17.8787826,8.31452174 C18.0653043,8.128 18.3685217,8.128 18.5550435,8.31452174 C18.7415652,8.50104348 18.7415652,8.80426087 18.5550435,8.99078261 L10.9028696,16.6429565 C10.810087,16.7357391 10.6876522,16.7826087 10.5652174,16.7826087 Z"
  })));
};
Success.displayName = "DecorativeIcon";

const Suitcase = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(0 -2)",
  d: "M20.5,22 L3.5,22 C1.57,22 0,20.43 0,18.5 L0,8.5 C0,6.57 1.57,5 3.5,5 L20.5,5 C22.43,5 24,6.57 24,8.5 L24,18.5 C24,20.43 22.43,22 20.5,22 Z M3.5,6 C2.121,6 1,7.121 1,8.5 L1,18.5 C1,19.879 2.121,21 3.5,21 L20.5,21 C21.879,21 23,19.879 23,18.5 L23,8.5 C23,7.121 21.879,6 20.5,6 L3.5,6 Z M15.5,6 L8.5,6 C8.224,6 8,5.776 8,5.5 L8,3.5 C8,2.673 8.673,2 9.5,2 L14.5,2 C15.327,2 16,2.673 16,3.5 L16,5.5 C16,5.776 15.776,6 15.5,6 Z M9,5 L15,5 L15,3.5 C15,3.225 14.775,3 14.5,3 L9.5,3 C9.225,3 9,3.225 9,3.5 L9,5 Z M6.5,22 L4.5,22 C4.224,22 4,21.776 4,21.5 L4,5.5 C4,5.224 4.224,5 4.5,5 L6.5,5 C6.776,5 7,5.224 7,5.5 L7,21.5 C7,21.776 6.776,22 6.5,22 Z M5,21 L6,21 L6,6 L5,6 L5,21 Z M19.5,22 L17.5,22 C17.224,22 17,21.776 17,21.5 L17,5.5 C17,5.224 17.224,5 17.5,5 L19.5,5 C19.776,5 20,5.224 20,5.5 L20,21.5 C20,21.776 19.776,22 19.5,22 Z M18,21 L19,21 L19,6 L18,6 L18,21 Z"
})));
Suitcase.displayName = "DecorativeIcon";

const Support = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M12.0002,17.7216 C12.5822,17.7216 13.0552,18.1946 13.0552,18.7766 C13.0552,19.3586 12.5822,19.8306 12.0002,19.8306 C11.4182,19.8306 10.9452,19.3586 10.9452,18.7766 C10.9452,18.1946 11.4182,17.7216 12.0002,17.7216 Z M12.001,5.2123 C14.019,5.2123 15.661,6.8543 15.661,8.8723 L15.661,9.6623 C15.661,10.6403 15.28,11.5593 14.588,12.2513 L13.293,13.5473 C12.803,14.0353 12.533,14.6873 12.533,15.3803 L12.533,16.1703 C12.533,16.4633 12.294,16.7033 12,16.7033 C11.706,16.7033 11.467,16.4633 11.467,16.1703 L11.467,15.3803 C11.467,14.4013 11.848,13.4833 12.539,12.7923 L13.834,11.4973 C14.325,11.0063 14.595,10.3543 14.595,9.6623 L14.595,8.8723 C14.595,7.4423 13.432,6.2783 12.001,6.2783 C10.57,6.2783 9.407,7.4423 9.407,8.8723 L9.407,9.9153 C9.407,10.2093 9.168,10.4483 8.874,10.4483 C8.58,10.4483 8.34,10.2093 8.34,9.9153 L8.34,8.8723 C8.34,6.8543 9.982,5.2123 12.001,5.2123 Z M12,22.934 C18.029,22.934 22.934,18.03 22.934,12 C22.934,5.972 18.029,1.067 12,1.067 C5.972,1.067 1.066,5.972 1.066,12 C1.066,18.03 5.972,22.934 12,22.934 Z M12,-1.77635684e-15 C18.616,-1.77635684e-15 24,5.384 24,12 C24,18.617 18.616,24 12,24 C5.383,24 0,18.617 0,12 C0,5.384 5.383,-1.77635684e-15 12,-1.77635684e-15 Z"
})));
Support.displayName = "DecorativeIcon";

const Tablet = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M12,20.5 C11.448,20.5 11,20.948 11,21.5 C11,22.052 11.448,22.5 12,22.5 C12.552,22.5 13,22.052 13,21.5 C13,20.948 12.552,20.5 12,20.5 Z M18.5,2 L5.5,2 C5.224,2 5,2.224 5,2.5 L5,19.5 C5,19.776 5.224,20 5.5,20 L18.5,20 C18.776,20 19,19.776 19,19.5 L19,2.5 C19,2.224 18.776,2 18.5,2 Z M18,19 L6,19 L6,3 L18,3 L18,19 Z M18.5,0 L5.5,0 C4.122,0 3,1.122 3,2.5 L3,21.5 C3,22.878 4.122,24 5.5,24 L18.5,24 C19.878,24 21,22.878 21,21.5 L21,2.5 C21,1.122 19.878,0 18.5,0 Z M20,21.5 C20,22.327 19.327,23 18.5,23 L5.5,23 C4.673,23 4,22.327 4,21.5 L4,2.5 C4,1.673 4.673,1 5.5,1 L18.5,1 C19.327,1 20,1.673 20,2.5 L20,21.5 Z"
})));
Tablet.displayName = "DecorativeIcon";

const Target = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M12.3787231,10.9154165 L18.50025,4.79388961 L18.50025,3.00088961 C18.50025,2.86788961 18.55325,2.74088961 18.64625,2.64688961 L20.64625,0.646889613 C20.79025,0.503889613 21.00525,0.459889614 21.19125,0.538889614 C21.37825,0.616889613 21.50025,0.798889613 21.50025,1.00088961 L21.50025,2.50088961 L23.00025,2.50088961 C23.20225,2.50088961 23.38525,2.62288961 23.46225,2.80988961 C23.53925,2.99688961 23.49625,3.21188961 23.35425,3.35488961 L21.35425,5.35488961 C21.26025,5.44888961 21.13325,5.50088961 21.00025,5.50088961 L19.20725,5.50088961 L13.0854716,11.622668 C13.3473717,12.0179185 13.5,12.4915316 13.5,13 C13.5,14.378 12.379,15.5 11,15.5 C9.621,15.5 8.5,14.378 8.5,13 C8.5,11.622 9.621,10.5 11,10.5 C11.5092453,10.5 11.9833067,10.6530095 12.3787231,10.9154165 Z M11.6471857,11.6469539 C11.4511356,11.5527847 11.2316071,11.5 11,11.5 C10.173,11.5 9.5,12.173 9.5,13 C9.5,13.827 10.173,14.5 11,14.5 C11.827,14.5 12.5,13.827 12.5,13 C12.5,12.7689993 12.4474914,12.550014 12.3537849,12.3543547 L11.35325,13.3548896 C11.25625,13.4518896 11.12825,13.5008896 11.00025,13.5008896 C10.87225,13.5008896 10.74425,13.4518896 10.64625,13.3548896 C10.45125,13.1598896 10.45125,12.8428896 10.64625,12.6478896 L11.6471857,11.6469539 Z M11,19.5 C7.416,19.5 4.5,16.584 4.5,13 C4.5,9.416 7.416,6.5 11,6.5 C11.97,6.5 12.911,6.715 13.797,7.139 C14.046,7.259 14.151,7.557 14.032,7.806 C13.913,8.055 13.614,8.16 13.365,8.041 C12.615,7.682 11.819,7.5 11,7.5 C7.968,7.5 5.5,9.967 5.5,13 C5.5,16.033 7.968,18.5 11,18.5 C14.032,18.5 16.5,16.033 16.5,13 C16.5,12.181 16.317,11.385 15.958,10.634 C15.839,10.385 15.944,10.087 16.193,9.967 C16.439,9.847 16.74,9.951 16.86,10.202 C17.285,11.089 17.5,12.03 17.5,13 C17.5,16.584 14.584,19.5 11,19.5 Z M11,23.5 C5.21,23.5 0.5,18.79 0.5,13 C0.5,7.21 5.21,2.5 11,2.5 C13.064,2.5 15.065,3.103 16.788,4.243 C17.017,4.395 17.081,4.706 16.929,4.936 C16.775,5.167 16.465,5.228 16.236,5.077 C14.678,4.046 12.867,3.5 11,3.5 C5.762,3.5 1.5,7.762 1.5,13 C1.5,18.238 5.762,22.5 11,22.5 C16.238,22.5 20.5,18.238 20.5,13 C20.5,11.133 19.955,9.322 18.923,7.764 C18.771,7.534 18.834,7.223 19.064,7.071 C19.293,6.92 19.603,6.981 19.757,7.212 C20.898,8.934 21.5,10.936 21.5,13 C21.5,18.79 16.79,23.5 11,23.5 Z M19.50025,4.50088961 L20.79325,4.50088961 L21.79325,3.50088961 L21.00025,3.50088961 C20.72425,3.50088961 20.50025,3.27688961 20.50025,3.00088961 L20.50025,2.20788961 L19.50025,3.20788961 L19.50025,4.50088961 Z"
})));
Target.displayName = "DecorativeIcon";

const Tasks = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "24",
  viewBox: "0 0 18 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-3)",
  d: "M5.7915,15.562 C5.7915,15.711 5.9135,15.833 6.0625,15.833 C6.2115,15.833 6.3335,15.711 6.3335,15.562 C6.3335,15.413 6.2115,15.291 6.0625,15.291 C5.9135,15.291 5.7915,15.413 5.7915,15.562 Z M6.0625,16.874 C5.3385,16.874 4.7495,16.286 4.7495,15.562 C4.7495,14.838 5.3385,14.25 6.0625,14.25 C6.7855,14.25 7.3745,14.838 7.3745,15.562 C7.3745,16.286 6.7855,16.874 6.0625,16.874 Z M9.229,12.1245 C8.942,12.1245 8.708,11.8905 8.708,11.6035 C8.708,11.3165 8.942,11.0825 9.229,11.0825 L18.729,11.0825 C19.016,11.0825 19.25,11.3165 19.25,11.6035 C19.25,11.8905 19.016,12.1245 18.729,12.1245 L9.229,12.1245 Z M9.229,8.166 C8.942,8.166 8.708,7.933 8.708,7.645 C8.708,7.358 8.942,7.124 9.229,7.124 L18.729,7.124 C19.016,7.124 19.25,7.358 19.25,7.645 C19.25,7.933 19.016,8.166 18.729,8.166 L9.229,8.166 Z M9.229,16.0825 C8.942,16.0825 8.708,15.8495 8.708,15.5615 C8.708,15.2745 8.942,15.0415 9.229,15.0415 L18.729,15.0415 C19.016,15.0415 19.25,15.2745 19.25,15.5615 C19.25,15.8495 19.016,16.0825 18.729,16.0825 L9.229,16.0825 Z M5.7915,11.6035 C5.7915,11.7525 5.9135,11.8745 6.0625,11.8745 C6.2115,11.8745 6.3335,11.7525 6.3335,11.6035 C6.3335,11.4545 6.2115,11.3325 6.0625,11.3325 C5.9135,11.3325 5.7915,11.4545 5.7915,11.6035 Z M6.0625,12.9155 C5.3385,12.9155 4.7495,12.3275 4.7495,11.6035 C4.7495,10.8795 5.3385,10.2915 6.0625,10.2915 C6.7855,10.2915 7.3745,10.8795 7.3745,11.6035 C7.3745,12.3275 6.7855,12.9155 6.0625,12.9155 Z M9.229,20.0415 C8.942,20.0415 8.708,19.8075 8.708,19.5205 C8.708,19.2325 8.942,18.9995 9.229,18.9995 L13.979,18.9995 C14.266,18.9995 14.5,19.2325 14.5,19.5205 C14.5,19.8075 14.266,20.0415 13.979,20.0415 L9.229,20.0415 Z M5.7915,19.52 C5.7915,19.669 5.9135,19.791 6.0625,19.791 C6.2115,19.791 6.3335,19.669 6.3335,19.52 C6.3335,19.371 6.2115,19.249 6.0625,19.249 C5.9135,19.249 5.7915,19.371 5.7915,19.52 Z M6.0625,20.832 C5.3385,20.832 4.7495,20.244 4.7495,19.52 C4.7495,18.796 5.3385,18.208 6.0625,18.208 C6.7855,18.208 7.3745,18.796 7.3745,19.52 C7.3745,20.244 6.7855,20.832 6.0625,20.832 Z M5.7915,7.6455 C5.7915,7.7945 5.9135,7.9165 6.0625,7.9165 C6.2115,7.9165 6.3335,7.7945 6.3335,7.6455 C6.3335,7.4965 6.2115,7.3745 6.0625,7.3745 C5.9135,7.3745 5.7915,7.4965 5.7915,7.6455 Z M6.0625,8.9575 C5.3385,8.9575 4.7495,8.3695 4.7495,7.6455 C4.7495,6.9215 5.3385,6.3335 6.0625,6.3335 C6.7855,6.3335 7.3745,6.9215 7.3745,7.6455 C7.3745,8.3695 6.7855,8.9575 6.0625,8.9575 Z M4.209,3.876 L4.209,22.499 C4.209,22.751 4.414,22.958 4.666,22.958 L19.334,22.958 C19.586,22.958 19.792,22.751 19.792,22.499 L19.792,3.876 C19.792,3.623 19.586,3.417 19.334,3.417 L16.875,3.417 L16.875,3.687 C16.875,3.974 16.641,4.208 16.354,4.208 L7.646,4.208 C7.358,4.208 7.125,3.974 7.125,3.687 L7.125,3.417 L4.666,3.417 C4.414,3.417 4.209,3.623 4.209,3.876 Z M11.376,1.486 C11.301,1.694 11.105,1.833 10.885,1.833 L9.229,1.833 C8.643,1.833 8.167,2.31 8.167,2.896 L8.167,3.166 L15.833,3.166 L15.833,2.896 C15.833,2.31 15.356,1.833 14.77,1.833 L13.115,1.833 C12.895,1.833 12.698,1.694 12.624,1.486 C12.529,1.22 12.278,1.041 12,1.041 C11.721,1.041 11.47,1.22 11.376,1.486 Z M19.334,2.376 C20.161,2.376 20.833,3.049 20.833,3.876 L20.833,22.499 C20.833,23.326 20.161,24 19.334,24 L4.666,24 C3.839,24 3.167,23.326 3.167,22.499 L3.167,3.876 C3.167,3.049 3.839,2.376 4.666,2.376 L7.189,2.376 C7.426,1.452 8.268,0.791 9.229,0.791 L10.563,0.791 C10.875,0.301 11.419,0 12,0 C12.579,0 13.123,0.301 13.436,0.791 L14.77,0.791 C15.732,0.791 16.574,1.452 16.81,2.376 L19.334,2.376 Z"
})));
Tasks.displayName = "DecorativeIcon";

const ThumbsUp = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "23",
  viewBox: "0 0 24 23"
}, /*#__PURE__*/React.createElement("path", {
  transform: "translate(0 -1)",
  d: "M7.5,22 C7.224,22 7,21.776 7,21.5 L7,12.5 C7,12.224 7.224,12 7.5,12 C7.776,12 8,12.224 8,12.5 L8,21.5 C8,21.776 7.776,22 7.5,22 Z M5.5,24 L2.5,24 C1.121,24 0,22.879 0,21.5 L0,13.5 C0,12.121 1.121,11 2.5,11 L7.5,11 C7.776,11 8,11.224 8,11.5 L8,11.691 L8.119,11.63 L11,5.391 L11,2 C11,1.848 11.069,1.704 11.188,1.609 C11.219,1.585 11.962,1 13,1 C14.157,1 16,2.831 16,5 C16,6.368 15.51,8.071 15.204,9 L21.381,9 C22.727,9 23.872,9.996 23.989,11.267 C24.054,11.98 23.816,12.665 23.349,13.176 C23.761,13.589 24,14.149 24,14.75 C24,15.617 23.504,16.379 22.766,16.751 C22.919,17.057 23,17.396 23,17.75 C23,18.617 22.503,19.38 21.765,19.751 C21.993,20.207 22.06,20.732 21.945,21.254 C21.721,22.266 20.768,23 19.679,23 L10.5,23 C9.805,23 8.685,22.775 7.853,22.347 C7.505,23.31 6.581,24 5.5,24 Z M2.5,12 C1.673,12 1,12.673 1,13.5 L1,21.5 C1,22.327 1.673,23 2.5,23 L5.5,23 C6.327,23 7,22.327 7,21.5 C7,21.298 7.122,21.115 7.309,21.038 C7.495,20.962 7.711,21.004 7.854,21.146 C8.326,21.619 9.688,22 10.5,22 L19.679,22 C20.303,22 20.845,21.596 20.968,21.038 C21.067,20.59 20.935,20.155 20.606,19.845 C20.464,19.711 20.413,19.508 20.474,19.323 C20.536,19.138 20.699,19.007 20.892,18.984 C21.523,18.911 22,18.381 22,17.75 C22,17.406 21.859,17.084 21.605,16.845 C21.463,16.711 21.412,16.508 21.473,16.323 C21.535,16.138 21.698,16.007 21.891,15.984 C22.523,15.911 23,15.381 23,14.75 C23,14.284 22.738,13.86 22.315,13.645 C22.155,13.562 22.051,13.4 22.044,13.219 C22.037,13.038 22.128,12.868 22.281,12.774 C22.772,12.471 23.046,11.929 22.993,11.359 C22.923,10.597 22.215,10 21.381,10 L14.5,10 C14.336,10 14.182,9.919 14.088,9.784 C13.995,9.648 13.975,9.475 14.033,9.322 C14.042,9.297 15,6.76 15,5 C15,3.362 13.548,2 13,2 C12.569,2 12.208,2.156 12,2.271 L12,5.5 C12,5.572 11.984,5.644 11.954,5.71 L8.954,12.21 C8.906,12.313 8.825,12.397 8.724,12.447 L7.724,12.947 C7.568,13.023 7.384,13.014 7.238,12.926 C7.09,12.834 7,12.673 7,12.5 L7,12 L2.5,12 Z"
})));
ThumbsUp.displayName = "DecorativeIcon";

const Time = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M16.5049,11.4668 C16.8189,11.4668 17.0379,11.6868 17.0379,11.9998 C17.0379,12.3138 16.8189,12.5328 16.5049,12.5328 L11.9999,12.5328 C11.6869,12.5328 11.4669,12.3138 11.4669,11.9998 L11.4669,3.8098 C11.4669,3.4958 11.6869,3.2768 11.9999,3.2768 C12.3139,3.2768 12.5329,3.4958 12.5329,3.8098 L12.5329,11.4668 L16.5049,11.4668 Z M12,22.9336 C18.029,22.9336 22.934,18.0296 22.934,11.9996 C22.934,5.9716 18.029,1.0666 12,1.0666 C5.972,1.0666 1.066,5.9716 1.066,11.9996 C1.066,18.0296 5.972,22.9336 12,22.9336 Z M12,-0.0004 C18.616,-0.0004 24,5.3836 24,11.9996 C24,18.6166 18.616,23.9996 12,23.9996 C5.383,23.9996 0,18.6166 0,11.9996 C0,5.3836 5.383,-0.0004 12,-0.0004 Z"
})));
Time.displayName = "DecorativeIcon";

const TowTruck = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  d: "M4.5 20.52a2.503 2.503 0 0 1-2.5-2.5c0-1.378 1.121-2.5 2.5-2.5S7 16.642 7 18.02s-1.121 2.5-2.5 2.5zm0-4c-.827 0-1.5.673-1.5 1.5s.673 1.5 1.5 1.5 1.5-.673 1.5-1.5-.673-1.5-1.5-1.5zm15 4a2.503 2.503 0 0 1-2.5-2.5c0-1.378 1.121-2.5 2.5-2.5s2.5 1.122 2.5 2.5-1.121 2.5-2.5 2.5zm0-4c-.827 0-1.5.673-1.5 1.5s.673 1.5 1.5 1.5 1.5-.673 1.5-1.5-.673-1.5-1.5-1.5zm-2-3h-1a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1zm-4.5.473a.5.5 0 0 1-.5.527H1.892l-.75 3H2.5a.5.5 0 0 1 0 1h-2a.503.503 0 0 1-.486-.621l1-4a.502.502 0 0 1 .486-.379h5.327L5.001 7.427V9.02c0 .827-.673 1.5-1.5 1.5S2 9.847 2 9.02a.5.5 0 0 1 1 0 .5.5 0 0 0 1 0v-5a.5.5 0 0 1 .5-.5h1.892a2.49 2.49 0 0 1 2.12 1.174L12 11.852V4.02a.5.5 0 0 1 .5-.5h9c.737 0 1.96.753 2.354 1.146A.504.504 0 0 1 24 5.02v1.5a.5.5 0 0 1-.276.447L23 7.329v3.382l.724.362a.5.5 0 0 1 .276.447v4.5c0 1.378-1.121 2.5-2.5 2.5a.5.5 0 0 1 0-1c.827 0 1.5-.673 1.5-1.5v-4.191l-.724-.362A.503.503 0 0 1 22 11.02v-4a.5.5 0 0 1 .276-.447L23 6.211v-.965c-.407-.319-1.193-.726-1.5-.726H13v9.473zm-5.127-.473h3.83L7.64 5.178c-.252-.394-.728-.658-1.248-.658h-1.22l2.7 9zm9.627 5h-11a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm3-7h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 1 0v3.5h3.5a.5.5 0 0 1 0 1z",
  fillRule: "nonzero"
})));
TowTruck.displayName = "DecorativeIcon";

const Transmitter = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M14.8127,8.645 L13.9927,5.717 L21.2077,5.717 L14.8127,8.645 Z M15.7767,15.79 L9.8257,12.029 L14.1667,10.041 L15.7767,15.79 Z M7.2367,22.958 L16.3057,17.678 L17.7857,22.958 L7.2367,22.958 Z M2.7457,5.717 L10.0077,5.717 L9.1647,8.725 L2.7457,5.717 Z M11.0457,5.717 L12.9547,5.717 L13.8927,9.066 L9.5507,11.055 L11.0457,5.717 Z M9.0787,12.74 L15.6597,16.898 L6.4037,22.288 L9.0787,12.74 Z M11.9997,2.312 L12.6737,4.717 L11.3267,4.717 L11.9997,2.312 Z M23.9887,5.109 C23.9757,5.052 23.9537,4.998 23.9227,4.95 C23.8827,4.886 23.8297,4.834 23.7687,4.795 C23.7087,4.757 23.6417,4.732 23.5687,4.722 C23.5417,4.718 23.5087,4.717 23.4897,4.717 L13.7127,4.717 L12.4817,0.324 C12.3607,-0.108 11.6397,-0.108 11.5187,0.324 L10.2877,4.717 L0.5117,4.717 C0.4787,4.716 0.4587,4.718 0.4327,4.722 C0.3587,4.732 0.2897,4.758 0.2297,4.796 L0.2297,4.797 L0.2297,4.797 C0.1707,4.834 0.1207,4.884 0.0817,4.944 C0.0487,4.994 0.0247,5.05 0.0117,5.109 C0.0027,5.149 -0.0003,5.188 -0.0003,5.228 L-0.0003,8.39 C-0.0003,8.666 0.2237,8.89 0.4997,8.89 C0.7767,8.89 0.9997,8.666 0.9997,8.39 L0.9997,6.004 L8.8917,9.701 L5.1387,23.095 C5.0727,23.201 5.0467,23.326 5.0697,23.45 C5.0677,23.56 5.0887,23.67 5.1577,23.76 C5.2527,23.885 5.3997,23.958 5.5567,23.958 L18.4447,23.958 C18.6007,23.958 18.7487,23.885 18.8427,23.76 C18.9377,23.636 18.9677,23.474 18.9257,23.324 L17.0977,16.8 C17.0907,16.772 17.0927,16.743 17.0817,16.715 C17.0787,16.708 17.0727,16.704 17.0697,16.698 L15.0857,9.62 L23.0007,5.996 L23.0007,8.39 C23.0007,8.666 23.2237,8.89 23.5007,8.89 C23.7767,8.89 24.0007,8.666 24.0007,8.39 L24.0007,5.228 C24.0007,5.188 23.9977,5.149 23.9887,5.109 L23.9887,5.109 Z"
})));
Transmitter.displayName = "DecorativeIcon";

const Tv = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "20",
  viewBox: "0 0 24 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M22.5,2 L1.5,2 C0.673,2 0,2.673 0,3.5 L0,17.5 C0,18.327 0.673,19 1.5,19 L10,19 L10,20.077 L4.418,21.007 C4.146,21.052 3.962,21.31 4.007,21.582 C4.048,21.827 4.26,22 4.5,22 C4.527,22 4.554,21.998 4.582,21.993 L10.54,21 L13.459,21 L19.417,21.993 C19.445,21.998 19.473,22 19.5,22 C19.741,22 19.953,21.827 19.992,21.582 C20.038,21.31 19.853,21.052 19.581,21.007 L14,20.077 L14,19 L22.5,19 C23.327,19 24,18.327 24,17.5 L24,3.5 C24,2.673 23.327,2 22.5,2 Z M13,20 L11,20 L11,19 L13,19 L13,20 Z M23,17.5 C23,17.776 22.776,18 22.5,18 L1.5,18 C1.224,18 1,17.776 1,17.5 L1,3.5 C1,3.224 1.224,3 1.5,3 L22.5,3 C22.776,3 23,3.224 23,3.5 L23,17.5 Z"
})));
Tv.displayName = "DecorativeIcon";

const TVChoiceAndFlexibility = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "48",
  height: "48",
  viewBox: "0 0 48 48"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M37,48H25c-0.6,0-1-0.4-1-1c0-2.8,2.2-5,5-5h1.6L23,34.4c-0.6-0.6-1-1.4-1-2.2c0-0.8,0.4-1.6,1-2.2 c1.2-1.2,3.2-1.2,4.4,0l1.8,1.8c0.2-0.4,0.4-0.6,0.6-1c0.6-0.6,1.6-1,2.6-0.8c0.2-0.6,0.4-1.2,0.8-1.6c0.8-0.8,2.2-1.2,3.2-0.8 c0.2-0.4,0.4-0.8,0.8-1.2c1.2-1.2,3.2-1.2,4.4,0l3,3.2c2,2,3.2,4.8,3.2,7.8C48,43.2,43.2,48,37,48L37,48z M26.2,46h11c5,0,9-4,9-9 c0-2.4-1-4.6-2.6-6.2l-3-3.2c-0.4-0.4-1.2-0.4-1.6,0s-0.4,1.2,0,1.6c0.2,0.2,0.2,0.4,0.2,0.8s0,0.6-0.2,0.8c-0.4,0.4-1,0.4-1.4,0 l-1-1c-0.4-0.4-1.2-0.4-1.6,0c-0.2,0.2-0.4,0.4-0.4,0.8s0.2,0.6,0.4,0.8l1,1c0.2,0.2,0.2,0.4,0.2,0.8c0,0.4,0,0.6-0.2,0.8 c-0.4,0.4-1,0.4-1.4,0L33,32.4c-0.4-0.4-1.2-0.4-1.6,0c-0.2,0.2-0.4,0.4-0.4,0.8c0,0.4,0.2,0.6,0.4,0.8l2.6,2.4 c0.2,0.2,0.2,0.4,0.2,0.8c0,0.4,0,0.6-0.2,0.8c-0.4,0.4-1,0.4-1.4,0L26,31.4c-0.4-0.4-1.2-0.4-1.6,0c-0.2,0.2-0.4,0.4-0.4,0.8 c0,0.4,0.2,0.6,0.4,0.8l9.4,9.4c0.2,0.2,0.4,0.8,0.2,1c-0.2,0.4-0.6,0.6-1,0.6h-4C27.6,44,26.6,44.8,26.2,46L26.2,46z M21,48H5c-2.8,0-5-2.2-5-5V5c0-2.8,2.2-5,5-5h24c2.8,0,5,2.2,5,5v20c0,0.6-0.4,1-1,1s-1-0.4-1-1V5 c0-1.6-1.4-3-3-3H5C3.4,2,2,3.4,2,5v38c0,1.6,1.4,3,3,3h16c0.6,0,1,0.4,1,1S21.6,48,21,48z M23,40H1c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S23.6,40,23,40z M19,44h-4c-0.6,0-1-0.4-1-1s0.4-1,1-1h4c0.6,0,1,0.4,1,1S19.6,44,19,44z M13,20H8c-1.7,0-3-1.3-3-3v-5c0-1.7,1.3-3,3-3h5c1.7,0,3,1.3,3,3v5C16,18.7,14.7,20,13,20z M8,11 c-0.6,0-1,0.4-1,1v5c0,0.6,0.4,1,1,1h5c0.6,0,1-0.4,1-1v-5c0-0.6-0.4-1-1-1H8z M26,20h-5c-1.7,0-3-1.3-3-3v-5c0-1.7,1.3-3,3-3h5c1.7,0,3,1.3,3,3v5C29,18.7,27.7,20,26,20z M21,11 c-0.6,0-1,0.4-1,1v5c0,0.6,0.4,1,1,1h5c0.6,0,1-0.4,1-1v-5c0-0.6-0.4-1-1-1H21z M13,33H8c-1.7,0-3-1.3-3-3v-5c0-1.7,1.3-3,3-3h5c1.7,0,3,1.3,3,3v5C16,31.7,14.7,33,13,33z M8,24 c-0.6,0-1,0.4-1,1v5c0,0.6,0.4,1,1,1h5c0.6,0,1-0.4,1-1v-5c0-0.6-0.4-1-1-1H8z M27,22c1.1,0,2,0.9,2,2l0,5.2c-0.9-1.3-2.4-2.2-4-2.2c-2.8,0-5,2.5-5,5.5c0,0.2,0,0.3,0,0.5l0,0 c-1.1,0-2-0.9-2-2v-7c0-1.1,0.9-2,2-2H27z M6,5c0,1.3-2,1.3-2,0C4,3.7,6,3.7,6,5z"
})));
TVChoiceAndFlexibility.displayName = "DecorativeIcon";

const TwoWayVoiceCall = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "25",
  height: "25",
  viewBox: "0 0 25 25",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M20.3071 8.11108L18.4609 9.88886L20.3071 11.6666",
  stroke: "#4B286D",
  fill: "transparent",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20.3071 2.77783C22.3462 2.77783 23.9994 4.36983 23.9994 6.33339C23.9994 8.29694 22.3462 9.88894 20.3071 9.88894H18.4609",
  stroke: "#4B286D",
  fill: "transparent",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16.6152 4.55556L18.4614 2.77778L16.6152 1",
  stroke: "#4B286D",
  fill: "transparent",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16.6161 9.88894C14.5771 9.88894 12.9238 8.29694 12.9238 6.33339C12.9238 4.36983 14.5771 2.77783 16.6161 2.77783H18.4623",
  stroke: "#4B286D",
  fill: "transparent",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M8.53881 16.5029C9.98272 17.9765 11.4945 18.8477 13.135 19.6849L16.317 16.5029C16.65 16.1699 17.1408 15.9083 17.5601 16.0532C18.8159 16.4718 20.1587 17.0071 21.4569 17.058C21.7652 17.058 22.0636 17.1867 22.2942 17.4172C22.5339 17.6569 22.6534 17.9645 22.6534 18.2714L22.2178 22.8351C22.2263 23.1335 22.1068 23.4411 21.8671 23.6808C21.6281 23.9198 21.3205 24.0393 21.0136 24.0393C15.9373 23.9028 11.264 22.1159 7.12459 17.9171C3.27298 14.0104 1.13893 9.10448 1.00246 4.02816C1.00246 3.72127 1.12196 3.41368 1.36096 3.17468C1.60067 2.93497 1.90826 2.81547 2.21515 2.81547L6.5384 2.26958C6.84599 2.27029 7.15358 2.38979 7.39259 2.62879C7.6231 2.85931 7.7426 3.1669 7.7518 3.46601C7.79422 4.77274 8.4391 6.37363 8.85771 7.62945C9.00337 8.04806 8.73255 8.53101 8.39102 8.87255L5.35682 11.9067C6.17707 13.5472 7.18611 15.122 8.53881 16.5029V16.5029Z",
  stroke: "#4B286D",
  fill: "#fff",
  strokeLinecap: "round",
  strokeLinejoin: "round"
})));
TwoWayVoiceCall.displayName = "DecorativeIcon";

const Umbrella = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none"
}, /*#__PURE__*/React.createElement("path", {
  d: "M18.8 1.99909C19.0048 1.99909 19.2096 1.92069 19.3648 1.76469C19.5432 1.58709 19.7936 1.00309 19.972 0.54469C20.0304 0.39669 19.9944 0.22869 19.8824 0.11669C19.7704 0.0046905 19.604 -0.0289095 19.4544 0.0270905C18.9968 0.20549 18.4128 0.45589 18.2344 0.63429C17.9224 0.94629 17.9224 1.45349 18.2344 1.76549C18.3904 1.92069 18.5952 1.99909 18.8 1.99909ZM10 3.99909C4.3928 3.99909 0 8.39189 0 13.9991C0 14.2207 0.1784 14.4095 0.3992 14.4095C0.6144 14.4095 0.788 14.2511 0.7984 14.0399C0.7992 14.0319 0.8 14.0239 0.8 14.0151C0.864 13.7535 1.7184 12.7991 2.8 12.7991C3.8864 12.7991 4.7472 13.7679 4.8 13.9991C4.8 14.2207 4.9784 14.4095 5.1992 14.4095C5.4144 14.4095 5.588 14.2511 5.5984 14.0399C5.5992 14.0319 5.6 14.0239 5.6 14.0151C5.664 13.7535 6.5184 12.7991 7.6 12.7991C8.6888 12.7991 9.5488 13.7671 9.6 13.9991V21.9991C9.6 22.6607 9.0616 23.1991 8.4 23.1991C7.7384 23.1991 7.2 22.6607 7.2 21.9991V21.1991C7.2 20.9783 7.0208 20.7991 6.8 20.7991C6.5792 20.7991 6.4 20.9783 6.4 21.1991V21.9991C6.4 23.1023 7.2976 23.9991 8.4 23.9991C9.5024 23.9991 10.4 23.1023 10.4 21.9991V14.0167V14.0159C10.4656 13.7535 11.3216 12.7991 12.4 12.7991C13.4864 12.7991 14.3472 13.7679 14.4 13.9991C14.4 14.2207 14.5784 14.4095 14.7992 14.4095C15.0144 14.4095 15.188 14.2511 15.1984 14.0399C15.1992 14.0319 15.2 14.0239 15.2 14.0151C15.264 13.7535 16.1184 12.7991 17.2 12.7991C18.2864 12.7991 19.1472 13.7679 19.2 13.9991C19.2 14.2199 19.3792 14.3991 19.6 14.3991C19.8208 14.3991 20 14.2199 20 13.9991C20 8.39189 15.6072 3.99909 10 3.99909ZM17.2 11.9991C16.2032 11.9991 15.2976 12.5895 14.8 13.1783C14.3024 12.5887 13.3968 11.9991 12.4 11.9991C11.4032 11.9991 10.4976 12.5887 10 13.1783C9.5024 12.5887 8.5968 11.9991 7.6 11.9991C6.6032 11.9991 5.6976 12.5895 5.2 13.1783C4.7024 12.5887 3.7968 11.9991 2.8 11.9991C2.072 11.9991 1.3928 12.3135 0.8856 12.7127C1.4936 8.18389 5.2784 4.79909 10 4.79909C14.7216 4.79909 18.5064 8.18389 19.1144 12.7127C18.6072 12.3135 17.928 11.9991 17.2 11.9991ZM20.2544 4.02709C19.7968 4.20549 19.2128 4.45589 19.0344 4.63429C18.7224 4.94629 18.7224 5.45349 19.0344 5.76549C19.1904 5.92069 19.3952 5.99909 19.6 5.99909C19.8048 5.99909 20.0096 5.92069 20.1648 5.76469C20.3432 5.58709 20.5936 5.00309 20.772 4.54469C20.8304 4.39669 20.7944 4.22869 20.6824 4.11669C20.5704 4.00549 20.404 3.97029 20.2544 4.02709ZM23.8824 4.11669C23.7704 4.00549 23.6032 3.97029 23.4544 4.02709C22.9968 4.20549 22.4128 4.45589 22.2344 4.63429C21.9224 4.94629 21.9224 5.45349 22.2344 5.76549C22.3904 5.92069 22.5952 5.99909 22.8 5.99909C23.0048 5.99909 23.2096 5.92069 23.3648 5.76469C23.5432 5.58709 23.7936 5.00309 23.972 4.54469C24.0304 4.39669 23.9944 4.22869 23.8824 4.11669Z",
  fill: "#4B286D"
})));
Umbrella.displayName = "DecorativeIcon";

const Upload = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M23.505,15.8693 C23.778,15.8693 24,16.0903 24,16.3633 L24,21.9183 C24,23.0663 23.067,24.0003 21.918,24.0003 L2.082,24.0003 C0.934,24.0003 -9.09494702e-13,23.0663 -9.09494702e-13,21.9183 L-9.09494702e-13,16.3633 C-9.09494702e-13,16.0903 0.221,15.8693 0.495,15.8693 C0.769,15.8693 0.99,16.0903 0.99,16.3633 L0.99,21.9183 C0.99,22.5203 1.48,23.0113 2.082,23.0113 L21.918,23.0113 C22.521,23.0113 23.011,22.5203 23.011,21.9183 L23.011,16.3633 C23.011,16.0903 23.232,15.8693 23.505,15.8693 Z M12.3350936,0.1307 L17.4930936,4.8917 C17.6930936,5.0767 17.7060936,5.3897 17.5200936,5.5907 C17.3350936,5.7917 17.0220936,5.8037 16.8210936,5.6187 L12.4940936,1.6247 L12.4940936,16.3637 C12.4940936,16.6367 12.2730936,16.8587 11.9990936,16.8587 C11.7260936,16.8587 11.5040936,16.6367 11.5040936,16.3637 L11.5040936,1.6247 L7.17709362,5.6187 C6.97809362,5.8037 6.66309362,5.7897 6.47909362,5.5907 C6.29309362,5.3897 6.30609362,5.0767 6.50709362,4.8917 L11.6630936,0.1307 C11.6860936,0.1097 11.7130936,0.0997 11.7390936,0.0837 C11.7640936,0.0687 11.7870936,0.0477 11.8140936,0.0367 C11.8740936,0.0127 11.9360936,-0.0003 11.9990936,-0.0003 C12.0620936,-0.0003 12.1240936,0.0127 12.1840936,0.0367 C12.2110936,0.0477 12.2340936,0.0687 12.2590936,0.0837 C12.2850936,0.0997 12.3120936,0.1097 12.3350936,0.1307 Z"
})));
Upload.displayName = "DecorativeIcon";

const UploadToCloud = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M19.5003,10.00005 C20.8793,10.00005 22.0003,11.12205 22.0003,12.50005 L22.0003,19.50005 C22.0003,20.87805 20.8793,22.00005 19.5003,22.00005 L13.0003,22.00005 L13.0003,23.00005 L16.5003,23.00005 C16.7763,23.00005 17.0003,23.22405 17.0003,23.50005 C17.0003,23.77605 16.7763,24.00005 16.5003,24.00005 L8.5003,24.00005 C8.2243,24.00005 8.0003,23.77605 8.0003,23.50005 C8.0003,23.22405 8.2243,23.00005 8.5003,23.00005 L12.0003,23.00005 L12.0003,22.00005 L5.5003,22.00005 C4.1213,22.00005 3.0003,20.87805 3.0003,19.50005 L3.0003,12.50005 C3.0003,11.12205 4.1213,10.00005 5.5003,10.00005 L10.5003,10.00005 C10.7763,10.00005 11.0003,10.22405 11.0003,10.50005 C11.0003,10.77605 10.7763,11.00005 10.5003,11.00005 L5.5003,11.00005 C4.6733,11.00005 4.0003,11.67305 4.0003,12.50005 L4.0003,18.00005 L21.0003,18.00005 L21.0003,12.50005 C21.0003,11.67305 20.3273,11.00005 19.5003,11.00005 L14.5003,11.00005 C14.2243,11.00005 14.0003,10.77605 14.0003,10.50005 C14.0003,10.22405 14.2243,10.00005 14.5003,10.00005 L19.5003,10.00005 Z M19.5003,21.00005 C20.3273,21.00005 21.0003,20.32705 21.0003,19.50005 L21.0003,19.00005 L4.0003,19.00005 L4.0003,19.50005 C4.0003,20.32705 4.6733,21.00005 5.5003,21.00005 L19.5003,21.00005 Z M12.5003,16.00005 C12.2243,16.00005 12.0003,15.77605 12.0003,15.50005 L12.0003,6.70705 L10.8543,7.85305 C10.6593,8.04805 10.3423,8.04805 10.1473,7.85305 C9.9523,7.65805 9.9523,7.34105 10.1473,7.14605 L12.1473,5.14605 C12.1473,5.14605 12.1493,5.14605 12.1493,5.14505 C12.2133,5.08205 12.2913,5.04705 12.3723,5.02505 C12.3953,5.01905 12.4163,5.01605 12.4393,5.01205 C12.5233,5.00205 12.6093,5.00505 12.6883,5.03805 C12.6893,5.03805 12.6913,5.03805 12.6923,5.03805 C12.6983,5.04105 12.7003,5.04605 12.7063,5.04905 C12.7583,5.07305 12.8103,5.10405 12.8533,5.14705 L14.8543,7.14705 C15.0483,7.34205 15.0483,7.65905 14.8543,7.85405 C14.7563,7.95105 14.6283,8.00005 14.5003,8.00005 C14.3723,8.00005 14.2443,7.95105 14.1463,7.85405 L13.0003,6.70805 L13.0003,15.50005 C13.0003,15.77605 12.7763,16.00005 12.5003,16.00005 Z M18.846,6.16895 C21.758,6.38295 24,8.81795 24,11.77895 C24,12.24395 23.932,12.71695 23.784,13.26695 C23.71,13.53995 23.438,13.69895 23.169,13.62495 C22.904,13.54995 22.746,13.26895 22.82,12.99595 C22.943,12.53595 23,12.14995 23,11.77895 C23,9.23795 20.982,7.16995 18.5,7.16995 C18.242,7.16595 17.962,6.99395 17.927,6.73795 C17.474,3.48095 14.711,1.02395 11.5,1.02395 C7.916,1.02395 5,4.01095 5,7.68195 C5,7.97095 5.024,8.27595 5.076,8.64195 C5.097,8.78995 5.053,8.94095 4.956,9.05395 C4.859,9.16595 4.71,9.21595 4.573,9.22695 C4.55,9.22695 4.488,9.21995 4.466,9.21595 C2.57,9.21795 1,10.82695 1,12.80295 C1,13.66695 1.303,14.47895 1.876,15.14995 C2.059,15.36395 2.037,15.68695 1.829,15.87295 C1.734,15.95795 1.617,15.99995 1.5,15.99995 C1.361,15.99995 1.223,15.93995 1.124,15.82495 C0.399,14.97595 4.54747351e-13,13.90295 4.54747351e-13,12.80295 C4.54747351e-13,10.42695 1.765,8.46495 4.022,8.21995 C4.007,8.03195 4,7.85495 4,7.68195 C4,3.44595 7.365,-5e-05 11.5,-5e-05 C15.065,-5e-05 18.152,2.62295 18.846,6.16895 Z"
})));
UploadToCloud.displayName = "DecorativeIcon";

const UsbCable = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M5.5,2 L3.5,2 C3.224,2 3,2.224 3,2.5 L3,4.5 C3,4.776 3.224,5 3.5,5 L5.5,5 C5.776,5 6,4.776 6,4.5 L6,2.5 C6,2.224 5.776,2 5.5,2 Z M5,4 L4,4 L4,3 L5,3 L5,4 Z M19.5,0 C17.019,0 15,2.019 15,4.5 L15,19 C15,21.206 13.206,23 11,23 C8.794,23 7,21.206 7,19 L7,18.975 C10.351,18.718 13,15.916 13,12.5 L13,9.5 C13,8.849 12.581,8.299 12,8.092 L12,0.5 C12,0.224 11.776,0 11.5,0 L1.5,0 C1.224,0 1,0.224 1,0.5 L1,8.092 C0.419,8.299 0,8.849 0,9.5 L0,12.5 C0,15.915 2.649,18.718 6,18.975 L6,19 C6,21.757 8.243,24 11,24 C13.757,24 16,21.757 16,19 L16,4.5 C16,2.57 17.57,1 19.5,1 C21.43,1 23,2.57 23,4.5 L23,8.5 C23,8.776 23.224,9 23.5,9 C23.776,9 24,8.776 24,8.5 L24,4.5 C24,2.019 21.981,0 19.5,0 Z M2,1 L11,1 L11,8 L2,8 L2,1 Z M1,12.5 L1,9.5 C1,9.224 1.224,9 1.5,9 L11.5,9 C11.776,9 12,9.224 12,9.5 L12,12.5 C12,15.533 9.533,18 6.5,18 C3.467,18 1,15.533 1,12.5 Z M9.5,2 L7.5,2 C7.224,2 7,2.224 7,2.5 L7,4.5 C7,4.776 7.224,5 7.5,5 L9.5,5 C9.776,5 10,4.776 10,4.5 L10,2.5 C10,2.224 9.776,2 9.5,2 Z M9,4 L8,4 L8,3 L9,3 L9,4 Z"
})));
UsbCable.displayName = "DecorativeIcon";

const User = props => {
  return /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M12,0 C5.383,0 0,5.383 0,12 C0,18.617 5.383,24 12,24 C18.617,24 24,18.617 24,12 C24,5.383 18.617,0 12,0 Z M12,23 C9.616,23 7.413,22.229 5.609,20.935 L8.193,20.073 C9.757,19.421 10.278,17.073 10.278,16.5 C10.278,16.35 10.211,16.209 10.096,16.114 C9.537,15.653 8.944,14.853 8.944,14.278 C8.944,13.605 8.669,13.223 8.401,13.036 C8.276,12.69 8.074,12.06 8.057,11.663 C8.306,11.635 8.5,11.423 8.5,11.166 L8.5,8.499 C8.5,7.072 9.863,4.999 12,4.999 C14.008,4.999 14.537,5.864 14.604,6.206 C14.586,6.27 14.579,6.333 14.585,6.389 C14.614,6.66 14.817,6.789 14.926,6.858 C15.098,6.967 15.5,7.223 15.5,8.5 L15.5,11.167 C15.5,11.444 15.634,11.636 15.91,11.636 C15.919,11.645 15.931,11.667 15.942,11.689 C15.918,12.088 15.724,12.692 15.599,13.036 C15.332,13.223 15.056,13.605 15.056,14.278 C15.056,14.853 14.463,15.653 13.904,16.114 C13.788,16.209 13.722,16.351 13.722,16.5 C13.722,17.072 14.244,19.421 15.842,20.085 L18.391,20.935 C16.588,22.229 14.384,23 12,23 Z M19.137,20.354 C19.091,20.206 18.985,20.079 18.827,20.026 L16.195,19.15 C15.275,18.767 14.848,17.295 14.748,16.706 C15.429,16.073 16.058,15.13 16.058,14.278 C16.058,13.989 16.14,13.877 16.124,13.874 C16.28,13.835 16.407,13.724 16.467,13.575 C16.516,13.452 16.947,12.353 16.947,11.612 C16.947,11.572 16.942,11.531 16.932,11.491 C16.869,11.24 16.722,10.987 16.502,10.829 L16.502,8.501 C16.502,7.061 16.063,6.459 15.6,6.11 C15.496,5.395 14.73,4.001 12.002,4.001 C9.214,4.001 7.502,6.622 7.502,8.501 L7.502,10.829 C7.282,10.987 7.135,11.24 7.072,11.491 C7.062,11.53 7.057,11.571 7.057,11.612 C7.057,12.353 7.488,13.452 7.537,13.575 C7.597,13.724 7.676,13.819 7.832,13.858 C7.864,13.877 7.946,13.988 7.946,14.278 C7.946,15.13 8.575,16.073 9.256,16.706 C9.156,17.295 8.733,18.765 7.843,19.137 L5.176,20.026 C5.017,20.079 4.911,20.207 4.865,20.356 C2.504,18.336 1,15.343 1,12 C1,5.935 5.935,1 12,1 C18.065,1 23,5.935 23,12 C23,15.341 21.497,18.334 19.137,20.354 Z"
  })));
};
User.displayName = "DecorativeIcon";

const Users = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "16",
  viewBox: "0 0 24 16"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -4)",
  d: "M6.71131209,14.8884129 C7.9554989,13.3403579 9.8640644,12.3478261 12,12.3478261 C14.1360345,12.3478261 16.0446778,13.3404498 17.2888607,14.8886278 C17.9161273,14.5907736 18.6043446,14.4347826 19.3043478,14.4347826 C21.8932174,14.4347826 24,16.5415652 24,19.1304348 C24,19.4184348 23.7662609,19.6521739 23.4782609,19.6521739 C23.1902609,19.6521739 22.9565217,19.4184348 22.9565217,19.1304348 C22.9565217,17.1165217 21.3182609,15.4782609 19.3043478,15.4782609 C18.8142915,15.4782609 18.3326371,15.5757243 17.8864706,15.7636746 C18.456456,16.7563327 18.7826087,17.9060261 18.7826087,19.1304348 C18.7826087,19.4184348 18.5488696,19.6521739 18.2608696,19.6521739 C17.9728696,19.6521739 17.7391304,19.4184348 17.7391304,19.1304348 C17.7391304,15.9655652 15.1648696,13.3913043 12,13.3913043 C8.83513043,13.3913043 6.26086957,15.9655652 6.26086957,19.1304348 C6.26086957,19.4184348 6.02713043,19.6521739 5.73913043,19.6521739 C5.45113043,19.6521739 5.2173913,19.4184348 5.2173913,19.1304348 C5.2173913,17.9059474 5.5435859,16.7561849 6.11363934,15.7634832 C5.66773769,15.5758002 5.18589921,15.4782609 4.69565217,15.4782609 C2.68173913,15.4782609 1.04347826,17.1165217 1.04347826,19.1304348 C1.04347826,19.4184348 0.80973913,19.6521739 0.52173913,19.6521739 C0.23373913,19.6521739 -2.66453526e-14,19.4184348 -2.66453526e-14,19.1304348 C-2.66453526e-14,16.5415652 2.10678261,14.4347826 4.69565217,14.4347826 C5.39593017,14.4347826 6.08441293,14.5908961 6.71131209,14.8884129 Z M4.76973913,13.3913043 C3.33182609,13.3913043 2.16104348,12.2205217 2.16104348,10.7826087 C2.16104348,9.34469565 3.33078261,8.17391304 4.76973913,8.17391304 C6.20869565,8.17391304 7.37843478,9.34469565 7.37843478,10.7826087 C7.37843478,12.2205217 6.20765217,13.3913043 4.76973913,13.3913043 Z M4.76973913,9.2173913 C3.90678261,9.2173913 3.20452174,9.91965217 3.20452174,10.7826087 C3.20452174,11.6455652 3.90678261,12.3478261 4.76973913,12.3478261 C5.63269565,12.3478261 6.33495652,11.6455652 6.33495652,10.7826087 C6.33495652,9.91965217 5.63269565,9.2173913 4.76973913,9.2173913 Z M12,11.3043478 C9.98608696,11.3043478 8.34782609,9.66608696 8.34782609,7.65217391 C8.34782609,5.63826087 9.98608696,4 12,4 C14.013913,4 15.6521739,5.63826087 15.6521739,7.65217391 C15.6521739,9.66608696 14.013913,11.3043478 12,11.3043478 Z M12,5.04347826 C10.562087,5.04347826 9.39130435,6.21426087 9.39130435,7.65217391 C9.39130435,9.09008696 10.562087,10.2608696 12,10.2608696 C13.437913,10.2608696 14.6086957,9.09008696 14.6086957,7.65217391 C14.6086957,6.21426087 13.437913,5.04347826 12,5.04347826 Z M19.3043478,13.3913043 C17.8664348,13.3913043 16.6956522,12.2205217 16.6956522,10.7826087 C16.6956522,9.34469565 17.8664348,8.17391304 19.3043478,8.17391304 C20.7422609,8.17391304 21.9130435,9.34469565 21.9130435,10.7826087 C21.9130435,12.2205217 20.7422609,13.3913043 19.3043478,13.3913043 Z M19.3043478,9.2173913 C18.4413913,9.2173913 17.7391304,9.91965217 17.7391304,10.7826087 C17.7391304,11.6455652 18.4413913,12.3478261 19.3043478,12.3478261 C20.1673043,12.3478261 20.8695652,11.6455652 20.8695652,10.7826087 C20.8695652,9.91965217 20.1673043,9.2173913 19.3043478,9.2173913 Z"
})));
Users.displayName = "DecorativeIcon";

const VideoChat = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 22 22"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-1 -1)",
  d: "M14.3109167,8.424725 C14.1596667,8.34130833 14.0643333,8.18180833 14.0643333,8.00855833 L14.0643333,6.67114167 C12.6215,6.67389167 8.70183333,6.670225 8.249,6.670225 C8.12525,6.82239167 7.7595,7.74180833 7.7595,9.45964167 C7.7595,11.2343083 8.1445,12.120725 8.2765,12.255475 L14.0661667,12.2490583 C14.0670833,11.6990583 14.0643333,10.9125583 14.0643333,10.9125583 C14.0643333,10.7393083 14.15875,10.5798083 14.31,10.4945583 C14.4603333,10.4111417 14.6464167,10.4148083 14.7930833,10.5073917 L16.9674167,11.8658917 L16.9674167,7.05339167 L14.7930833,8.41189167 C14.64825,8.50264167 14.4649167,8.50905833 14.3109167,8.424725 Z M8.20683333,13.2023917 C6.84558333,13.2023917 6.80616667,9.84280833 6.80616667,9.45964167 C6.80616667,9.076475 6.84558333,5.71780833 8.20683333,5.71780833 C8.44241667,5.71780833 13.93325,5.721475 14.5373333,5.71780833 L14.6161667,5.73339167 C14.70875,5.754475 14.7958333,5.77555833 14.8774167,5.856225 C14.9654167,5.94514167 15.0176667,6.06889167 15.0176667,6.19355833 L15.0176667,7.148725 L17.192,5.79114167 C17.33775,5.699475 17.5238333,5.693975 17.6741667,5.77739167 C17.8263333,5.861725 17.92075,6.021225 17.92075,6.194475 L17.92075,12.7266417 C17.92075,12.8980583 17.8263333,13.0593917 17.6750833,13.143725 C17.60175,13.182225 17.522,13.2023917 17.44225,13.2023917 C17.3533333,13.2023917 17.2671667,13.1785583 17.1910833,13.129975 L15.0176667,11.7723917 C15.0185833,12.1711417 15.0185833,12.588225 15.0176667,12.7330583 C15.014,12.9915583 14.7995,13.2023917 14.5400833,13.2023917 L8.20683333,13.2023917 Z M5.83175,17.3299583 C6.09391667,17.3299583 6.3075,17.542625 6.3075,17.806625 L6.3075,21.1634583 L10.9165,17.4362917 C11.0008333,17.3684583 11.1071667,17.330875 11.21625,17.330875 L19.62025,17.330875 C20.9585833,17.330875 22.0466667,16.241875 22.0466667,14.9044583 L22.0466667,4.74320833 C22.0466667,3.404875 20.9585833,2.315875 19.62025,2.315875 L4.37975,2.315875 L4.37883333,2.315875 C3.73166667,2.315875 3.123,2.56795833 2.66466667,3.02720833 C2.20541667,3.48554167 1.95333333,4.095125 1.95333333,4.74229167 L1.95333333,14.9035417 C1.95333333,16.241875 3.04141667,17.3299583 4.37975,17.3299583 L5.83175,17.3299583 Z M19.6211667,1.36345833 C21.48475,1.36345833 23,2.87870833 23,4.74229167 L23,14.9035417 C23,16.767125 21.48475,18.282375 19.6211667,18.282375 L11.3858333,18.282375 L6.1315,22.531125 C6.04716667,22.599875 5.93991667,22.6365417 5.83175,22.6365417 C5.76025,22.6365417 5.68966667,22.6200417 5.6255,22.5897917 C5.46141667,22.511875 5.35508333,22.344125 5.35508333,22.1617083 L5.35508333,18.282375 L4.37975,18.282375 C2.51616667,18.282375 1,16.767125 1,14.9035417 L1,4.74229167 C1,2.87870833 2.51616667,1.36345833 4.37975,1.36345833 L19.6211667,1.36345833 Z"
})));
VideoChat.displayName = "DecorativeIcon";

const VideoGames = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "25",
  height: "20",
  viewBox: "0 0 25 20"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -2)",
  d: "M7.9998,10.125 C7.9998,9.731 7.8468,9.361 7.5678,9.082 C7.2888,8.803 6.9188,8.65 6.5248,8.65 C6.1308,8.65 5.7608,8.803 5.4818,9.082 C5.2028,9.361 5.0498,9.731 5.0498,10.125 C5.0498,10.519 5.2028,10.889 5.4818,11.168 C6.0378,11.725 7.0128,11.723 7.5678,11.168 C7.8468,10.889 7.9998,10.519 7.9998,10.125 Z M6.5248,7.623 C7.2038,7.623 7.8548,7.884 8.3098,8.34 C8.7868,8.816 9.0498,9.45 9.0498,10.125 C9.0498,10.8 8.7868,11.434 8.3098,11.91 C7.8328,12.387 7.1998,12.65 6.5248,12.65 C5.8498,12.65 5.2158,12.387 4.7398,11.91 C4.2628,11.434 3.9998,10.8 3.9998,10.125 C3.9998,9.45 4.2628,8.816 4.7398,8.34 C5.1948,7.884 5.8458,7.623 6.5248,7.623 Z M17.8494,9.6001 L19.3254,9.6001 C19.6144,9.6001 19.8494,9.8351 19.8494,10.1251 C19.8494,10.4141 19.6144,10.6501 19.3254,10.6501 L17.8494,10.6501 L17.8494,12.1251 C17.8494,12.4141 17.6144,12.6501 17.3254,12.6501 C17.0354,12.6501 16.7994,12.4141 16.7994,12.1251 L16.7994,10.6501 L15.3254,10.6501 C15.0354,10.6501 14.7994,10.4141 14.7994,10.1251 C14.7994,9.8351 15.0354,9.6001 15.3254,9.6001 L16.7994,9.6001 L16.7994,8.1251 C16.7994,7.8351 17.0354,7.6001 17.3254,7.6001 C17.6144,7.6001 17.8494,7.8351 17.8494,8.1251 L17.8494,9.6001 Z M23.2,14.0044 C23.2,8.6814 19.86,3.0504 18.064,3.0504 C17.006,3.0504 16.016,3.6494 15.373,4.1514 C14.595,4.7594 13.594,5.0944 12.555,5.0944 L11.694,5.0944 C10.657,5.0944 9.657,4.7594 8.877,4.1524 C8.233,3.6494 7.244,3.0504 6.186,3.0504 C4.389,3.0504 1.05,8.6814 1.05,14.0044 C1.05,17.6504 2.293,20.4004 3.942,20.4004 C5.382,20.4004 6.32,19.0224 6.854,17.8654 C7.581,16.3004 9.165,15.2894 10.889,15.2894 L13.36,15.2894 C15.086,15.2894 16.67,16.3004 17.395,17.8644 C17.93,19.0214 18.869,20.4004 20.306,20.4004 C21.956,20.4004 23.2,17.6504 23.2,14.0044 Z M22.143,5.8554 C23.482,8.3634 24.25,11.3334 24.25,14.0044 C24.25,18.3884 22.629,21.4494 20.306,21.4494 C18.728,21.4494 17.392,20.3624 16.443,18.3074 C15.888,17.1114 14.679,16.3394 13.36,16.3394 L10.897,16.3394 C9.573,16.3394 8.362,17.1114 7.806,18.3074 C6.858,20.3624 5.521,21.4494 3.942,21.4494 C1.621,21.4494 -1.77635684e-15,18.3884 -1.77635684e-15,14.0044 C-1.77635684e-15,11.3344 0.767,8.3634 2.106,5.8554 C3.394,3.4414 4.92,2.0004 6.186,2.0004 C7.543,2.0004 8.749,2.7204 9.523,3.3244 C10.119,3.7884 10.89,4.0444 11.694,4.0444 L12.555,4.0444 C13.359,4.0444 14.131,3.7884 14.726,3.3244 C15.5,2.7204 16.706,2.0004 18.064,2.0004 C19.331,2.0004 20.855,3.4414 22.143,5.8554 Z"
})));
VideoGames.displayName = "DecorativeIcon";

const Visible = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "14",
  viewBox: "0 0 24 14"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -5)",
  d: "M12,19 C5.839,19 0.349,12.596 0.118,12.323 C-0.039,12.136 -0.039,11.863 0.118,11.677 C0.349,11.404 5.839,5 12,5 C19.18,5 23.722,11.441 23.911,11.716 C24.04,11.902 24.027,12.151 23.882,12.323 C23.651,12.596 18.161,19 12,19 Z M1.172,12 C2.365,13.29 7.061,18 12,18 C16.981,18 21.704,13.222 22.854,11.973 C21.858,10.703 17.779,6 12,6 C7.054,6 2.363,10.709 1.172,12 Z M12,16 C9.794,16 8,14.206 8,12 C8,9.794 9.794,8 12,8 C14.206,8 16,9.794 16,12 C16,14.206 14.206,16 12,16 Z M12,9 C10.346,9 9,10.346 9,12 C9,13.654 10.346,15 12,15 C13.654,15 15,13.654 15,12 C15,10.346 13.654,9 12,9 Z"
})));
Visible.displayName = "DecorativeIcon";

const Warranty = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M14.5211333,11.6702089 L23.229,20.141 C23.721,20.634 24,21.31 24,21.999 C24,23.103 23.103,24 22,24 C21.3,24 20.642,23.728 20.147,23.232 L12.0039848,14.8613431 C11.9857035,14.8891246 11.9643752,14.9154998 11.94,14.94 C11.656,15.223 11.5,15.599 11.5,16 C11.5,16.127 11.45,16.251 11.363,16.344 C11.263,16.45 5.071,23.134 5.071,23.134 C4.508,23.697 3.777,24 3,24 C2.23,24 1.48,23.689 0.938,23.147 L0.845,23.05 C0.303,22.508 1.0658141e-14,21.777 1.0658141e-14,21 C1.0658141e-14,20.23 0.311,19.48 0.853,18.939 L7.751,12.714 C7.843,12.631 7.962,12.585 8.086,12.585 C8.087,12.585 8.087,12.585 8.088,12.585 C8.487,12.585 8.863,12.429 9.147,12.146 C9.18501943,12.1079806 9.22767656,12.0773738 9.27316294,12.0541798 L7.484,10.215 C7.106,9.827 6.547,9.671 6.022,9.813 C5.548,9.94 5.223,10 5,10 C3.629,10 2.303,9.428 1.361,8.43 C0.407,7.417 -0.073,6.092 0.009,4.699 C0.019,4.527 0.117,4.372 0.269,4.289 C0.423,4.204 0.633,4.197 0.786,4.289 L3.521,5.93 C4.353,5.5 4.896,4.693 4.986,3.775 L1.931,1.941 C1.79,1.857 1.7,1.71 1.688,1.547 C1.678,1.384 1.746,1.226 1.874,1.124 C2.754,0.414 3.799,0.025 4.894,0.001 C6.128,-0.021 7.332,0.486 8.289,1.441 C9.516,2.667 10.011,4.277 9.722,6.1 C9.644,6.59 9.805,7.083 10.153,7.421 L12.3081345,9.51746001 C12.3309518,9.47410983 12.3605737,9.43342633 12.397,9.397 L18,3.793 L18,2.5 C18,2.311 18.107,2.138 18.276,2.053 L22.276,0.053 C22.469,-0.044 22.701,-0.006 22.853,0.147 L23.853,1.147 C24.005,1.299 24.043,1.532 23.947,1.724 L21.947,5.724 C21.862,5.893 21.689,6 21.5,6 L20.207,6 L14.603,11.604 C14.5776447,11.6293553 14.5501712,11.6514309 14.5211333,11.6702089 Z M13.822413,10.9905115 C13.8426957,10.9572071 13.8672248,10.9257752 13.896,10.897 L19.646,5.147 C19.74,5.053 19.867,5 20,5 L21.191,5 L22.891,1.599 L22.401,1.109 L19,2.809 L19,4 C19,4.133 18.947,4.26 18.854,4.354 L13.104,10.104 C13.0709888,10.1370112 13.0344812,10.164434 12.9956611,10.1862684 L13.822413,10.9905115 Z M11.3227357,14.1610493 L9.93958198,12.7392289 C9.91723066,12.7804051 9.88870333,12.8191187 9.854,12.854 C9.43,13.279 8.879,13.532 8.288,13.578 L1.542,19.664 C1.204,20.001 1,20.494 1,20.997 C1,21.511 1.199,21.99 1.56,22.351 L1.654,22.449 C2.357,23.152 3.636,23.156 4.351,22.441 C7.914,18.595 9.982,16.363 10.508,15.795 C10.556,15.204 10.809,14.655 11.233,14.232 C11.2606855,14.2044565 11.2908301,14.1808034 11.3227357,14.1610493 Z M6.41,8.762 C7.075,8.762 7.724,9.028 8.201,9.518 L20.859,22.53 C21.16,22.832 21.567,23 22,23 C22.552,23 23,22.551 23,22 C23,21.567 22.831,21.16 22.525,20.854 L9.454,8.139 C8.874,7.575 8.604,6.755 8.732,5.945 C8.972,4.43 8.586,3.153 7.581,2.15 C6.82,1.389 5.918,0.981 4.915,1.001 C4.285,1.015 3.675,1.181 3.117,1.488 L5.757,3.071 C5.908,3.162 6,3.324 6,3.5 C6,4.924 5.209,6.205 3.935,6.842 L3.724,6.947 C3.57,7.023 3.388,7.016 3.243,6.929 L1.045,5.61 C1.166,6.406 1.524,7.143 2.089,7.743 C2.854,8.554 3.887,9 5,9 C5.059,9 5.25,8.985 5.763,8.847 C5.977,8.79 6.194,8.762 6.41,8.762 Z"
})));
Warranty.displayName = "DecorativeIcon";

const Watch = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "15",
  height: "24",
  viewBox: "0 0 15 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(-5)",
  d: "M19,14.9996603 L19,15.4996603 C19,16.5632877 18.6404217,17.3844162 17.9872112,17.896555 C17.9955926,17.9298301 18,17.9643189 18,17.9996603 L18,18.9996603 C18,19.8266604 17.1924,20.4996603 16.2,20.4996603 L15.6,20.4996603 C15.5700629,20.4996603 15.5406356,20.4978302 15.5118705,20.4942969 L14.991062,23.0983396 C14.943062,23.3323396 14.738062,23.5003396 14.500062,23.5003396 L10.500062,23.5003396 C10.262062,23.5003396 10.057062,23.3323396 10.010062,23.0983396 L9.48922631,20.4941613 C9.46011263,20.4977834 9.43031775,20.4996603 9.4,20.4996603 L8.8,20.4996603 C7.8076,20.4996603 7,19.8266604 7,18.9996603 L7,17.9996603 C7,17.9643189 7.00440737,17.9298301 7.01278878,17.896555 C6.35957825,17.3844162 6,16.5632877 6,15.4996603 L6,9.99966035 C6,10.2756603 5.776,10.4996603 5.5,10.4996603 C5.224,10.4996603 5,10.2756603 5,9.99966035 L5,8.99966035 C5,8.72366035 5.224,8.49966035 5.5,8.49966035 C5.776,8.49966035 6,8.72366035 6,8.99966035 L6,7.49966035 C6,7.00539713 6.35524925,6.43380936 7.00098908,6.02858947 C7.00033269,6.01901578 7,6.00937025 7,5.99966035 L7,4.99966035 C7,4.17266035 7.8076,3.49966035 8.8,3.49966035 L9.4,3.49966035 C9.43036441,3.49966035 9.46020433,3.50154312 9.48936072,3.50517611 L10.0100639,0.90166035 C10.0570639,0.66766035 10.2620639,0.49966035 10.5000639,0.49966035 L14.5000639,0.49966035 C14.7380639,0.49966035 14.9430639,0.66766035 14.9900639,0.90166035 L15.5107639,3.5051606 C15.5398807,3.50153776 15.5696789,3.49966035 15.6,3.49966035 L16.2,3.49966035 C17.1924,3.49966035 18,4.17266035 18,4.99966035 L18,5.99966035 C18,6.00937025 17.9996673,6.01901578 17.9990109,6.02858947 C18.6447507,6.43380936 19,7.00539713 19,7.49966035 L19,8.99966035 C19,8.72366035 19.224,8.49966035 19.5,8.49966035 C19.776,8.49966035 20,8.72366035 20,8.99966035 L20,9.99966035 C20,10.2756603 19.776,10.4996603 19.5,10.4996603 C19.224,10.4996603 19,10.2756603 19,9.99966035 L19,13.9996603 C19,13.7236603 19.224,13.4996603 19.5,13.4996603 C19.776,13.4996603 20,13.7236603 20,13.9996603 L20,14.9996603 C20,15.2756603 19.776,15.4996603 19.5,15.4996603 C19.224,15.4996603 19,15.2756603 19,14.9996603 Z M15.7096639,4.49966035 L15.9096639,5.49966035 L16,5.49966035 C16.2844587,5.49966035 16.5515451,5.52537482 16.8,5.57206431 L16.8,4.99966035 C16.8,4.72366035 16.53,4.49966035 16.2,4.49966035 L15.7096639,4.49966035 Z M9.29046387,4.49966035 L8.8,4.49966035 C8.47,4.49966035 8.2,4.72366035 8.2,4.99966035 L8.2,5.57206431 C8.44845486,5.52537482 8.71554135,5.49966035 9,5.49966035 L9.09046387,5.49966035 L9.29046387,4.49966035 Z M16.8,18.4237868 C16.5515451,18.4739459 16.2844587,18.4996603 16,18.4996603 L15.9107978,18.4996603 L15.7107978,19.4996603 L16.2,19.4996603 C16.53,19.4996603 16.8,19.2756603 16.8,18.9996603 L16.8,18.4237868 Z M8.2,18.4237868 L8.2,18.9996603 C8.2,19.2756603 8.47,19.4996603 8.8,19.4996603 L9.29032612,19.4996603 L9.09032612,18.4996603 L9,18.4996603 C8.71554135,18.4996603 8.44845486,18.4739459 8.2,18.4237868 Z M10.1104482,18.4996603 L10.910062,22.5003396 L14.090062,22.5003396 L14.8905459,18.4996603 L10.1104482,18.4996603 Z M10.1097159,5.49966035 L14.8904118,5.49966035 L14.0900639,1.49966035 L10.9100639,1.49966035 L10.1097159,5.49966035 Z M9.4803398,6.49966035 L9,6.49966035 C7.673,6.49966035 7,7.17266035 7,8.49966035 L7,16.4996603 C7,16.8266604 7.673,17.4996603 9,17.4996603 L17,17.4996603 C17.327,17.4996603 18,16.8266604 18,16.4996603 L18,8.49966035 C18,7.17266035 17.327,6.49966035 17,6.49966035 L9.51854438,6.49966035 C9.50584363,6.50017855 9.49309928,6.50018396 9.48033995,6.49966035 Z M17,16.4996603 L9,16.4996603 C8.224,16.4996603 8,16.2756603 8,16.4996603 L8,8.49966035 C8,7.72366035 8.224,7.49966035 9,7.49966035 L17,7.49966035 C16.776,7.49966035 17,7.72366035 17,8.49966035 L17,16.4996603 C17,16.2756603 16.776,16.4996603 17,16.4996603 Z M9,15.4996603 L16,15.4996603 L16,8.49966035 L9,8.49966035 L9,15.4996603 Z"
})));
Watch.displayName = "DecorativeIcon";

const WebstoreTeam = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "20px",
  height: "20px",
  viewBox: "0 0 20 20"
}, /*#__PURE__*/React.createElement("path", {
  d: "M17.917 0C19.083 0 20 .917 20 2.083v15.834A2.063 2.063 0 0117.917 20H2.083A2.063 2.063 0 010 17.917V2.083C0 .917.917 0 2.083 0zm1.25 4.167H.833v13.75c0 .666.584 1.25 1.25 1.25h15.834c.666 0 1.25-.584 1.25-1.25V4.167zm-10.417 10c.667 0 1.25.583 1.25 1.25 0 .666-.583 1.25-1.25 1.25s-1.25-.584-1.25-1.25c0-.667.583-1.25 1.25-1.25zm3.333 0c.667 0 1.25.583 1.25 1.25 0 .666-.583 1.25-1.25 1.25-.666 0-1.25-.584-1.25-1.25 0-.667.584-1.25 1.25-1.25zM8.75 15c-.25 0-.417.167-.417.417 0 .25.167.416.417.416.25 0 .417-.166.417-.416 0-.25-.167-.417-.417-.417zm3.333 0c-.25 0-.416.167-.416.417 0 .25.166.416.416.416.25 0 .417-.166.417-.416 0-.25-.167-.417-.417-.417zM5.25 7.583c.167 0 .333.167.417.334l.166.5H14.5c.167 0 .25.083.333.166.084.084.084.25.084.334l-.834 3.333a.358.358 0 01-.333.333l-6.583.75L7.5 14.5c0 .25-.083.417-.333.5h-.084c-.166 0-.333-.167-.416-.333L5.083 8.333H3.75c-.25 0-.583-.083-.583-.333s.166-.417.416-.417zm.917 1.5L7 12.417l6.417-.75.666-2.5-7.916-.084zm11.75-8.25H2.083c-.666 0-1.25.584-1.25 1.25v1.25h18.334v-1.25c0-.666-.584-1.25-1.25-1.25zM3.75 1.667a.417.417 0 110 .833.417.417 0 010-.833zm-1.667 0a.417.417 0 110 .833.417.417 0 010-.833zm3.334 0a.417.417 0 110 .833.417.417 0 010-.833z"
})));
WebstoreTeam.displayName = "DecorativeIcon";

const WifiBoost = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M9.55555556,1 C4.8304527,1 1,4.8304527 1,9.55555556 L1,14.4444444 C1,19.1695473 4.8304527,23 9.55555556,23 L14.4444444,23 C19.1695473,23 23,19.1695473 23,14.4444444 L23,9.55555556 C23,4.8304527 19.1695473,1 14.4444444,1 L9.55555556,1 Z M9.6,0 L14.4,0 C19.7019336,0 24,4.2980664 24,9.6 L24,14.4 C24,19.7019336 19.7019336,24 14.4,24 L9.6,24 C4.2980664,24 0,19.7019336 0,14.4 L0,9.6 C0,4.2980664 4.2980664,0 9.6,0 Z M12,14 C11.448,14 11,14.448 11,15 C11,15.552 11.448,16 12,16 C12.552,16 13,15.552 13,15 C13,14.448 12.552,14 12,14 Z M7.404,9.904 C7.209,10.099 7.209,10.416 7.404,10.611 C7.599,10.806 7.916,10.806 8.111,10.611 C10.255,8.466 13.744,8.466 15.889,10.611 C15.987,10.708 16.115,10.757 16.243,10.757 C16.371,10.757 16.499,10.708 16.596,10.611 C16.791,10.416 16.791,10.099 16.596,9.904 C14.062,7.37 9.938,7.37 7.404,9.904 Z M8.818,11.318 C8.623,11.513 8.623,11.83 8.818,12.025 C9.013,12.22 9.33,12.22 9.525,12.025 C10.889,10.661 13.111,10.661 14.475,12.025 C14.573,12.122 14.701,12.171 14.829,12.171 C14.957,12.171 15.084,12.123 15.182,12.025 C15.377,11.83 15.377,11.513 15.182,11.318 C13.427,9.564 10.573,9.564 8.818,11.318 Z M10.232,12.733 C10.037,12.928 10.037,13.245 10.232,13.44 C10.427,13.635 10.744,13.635 10.939,13.44 C11.505,12.874 12.494,12.874 13.06,13.44 C13.158,13.537 13.286,13.586 13.414,13.586 C13.542,13.586 13.67,13.537 13.767,13.44 C13.962,13.245 13.962,12.928 13.767,12.733 C12.824,11.789 11.175,11.789 10.232,12.733 Z"
})));
WifiBoost.displayName = "DecorativeIcon";

const WifiCloud = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "17",
  viewBox: "0 0 24 17"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  transform: "translate(0 -4)",
  d: "M18.5,21 L4.5,21 C2.019,21 0,18.981 0,16.5 C0,14.18 1.765,12.265 4.022,12.025 C4.007,11.842 4,11.669 4,11.5 C4,7.364 7.364,4 11.5,4 C15.064,4 18.151,6.561 18.846,10.023 C21.758,10.232 24,12.609 24,15.5 C24,18.533 21.532,21 18.5,21 Z M4.466,12.999 C2.57,13 1,14.57 1,16.5 C1,18.43 2.57,20 4.5,20 L18.5,20 C20.981,20 23,17.981 23,15.5 C23,13.019 20.981,11 18.5,11 C18.284,11.016 17.962,10.828 17.927,10.578 C17.474,7.398 14.711,5 11.5,5 C7.916,5 5,7.916 5,11.5 C5,11.782 5.024,12.08 5.076,12.437 C5.097,12.582 5.053,12.729 4.956,12.839 C4.859,12.949 4.704,13 4.572,13.008 C4.55,13.008 4.488,13.002 4.466,12.999 Z M11.53,17.5 C11.254,17.5 11.025,17.276 11.025,17 C11.025,16.724 11.244,16.5 11.519,16.5 L11.53,16.5 C11.805,16.5 12.03,16.724 12.03,17 C12.03,17.276 11.806,17.5 11.53,17.5 Z M16,13.693 C15.858,13.693 15.718,13.633 15.619,13.517 C14.516,12.216 13.053,11.5 11.5,11.5 C9.947,11.5 8.484,12.216 7.381,13.517 C7.203,13.727 6.888,13.754 6.677,13.575 C6.466,13.396 6.441,13.081 6.619,12.87 C7.915,11.342 9.649,10.5 11.5,10.5 C13.351,10.5 15.085,11.342 16.381,12.87 C16.56,13.081 16.534,13.396 16.323,13.575 C16.229,13.654 16.114,13.693 16,13.693 Z M14.8,15.107 C14.658,15.107 14.518,15.047 14.419,14.93 C13.635,14.007 12.599,13.498 11.5,13.498 C10.401,13.498 9.365,14.006 8.581,14.93 C8.403,15.141 8.088,15.167 7.877,14.988 C7.666,14.809 7.641,14.494 7.819,14.283 C8.795,13.132 10.102,12.498 11.5,12.498 C12.898,12.498 14.205,13.132 15.181,14.283 C15.36,14.493 15.334,14.809 15.123,14.988 C15.029,15.068 14.914,15.107 14.8,15.107 Z M13.6,16.521 C13.458,16.521 13.318,16.461 13.219,16.344 C12.291,15.252 10.709,15.252 9.781,16.344 C9.603,16.555 9.287,16.581 9.077,16.402 C8.866,16.223 8.841,15.908 9.019,15.697 C10.332,14.149 12.667,14.149 13.98,15.697 C14.159,15.907 14.133,16.223 13.922,16.402 C13.829,16.482 13.714,16.521 13.6,16.521 Z"
})));
WifiCloud.displayName = "DecorativeIcon";

const OnlineSecurity = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "32",
  height: "29",
  viewBox: "0 0 32 29"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M20.06 16.69H18.87C18.97 15.69 19.02 14.61 19.02 13.5C19.02 12.39 18.97 11.33 18.87 10.31H24.87C24.9925 10.7304 25.0893 11.1579 25.16 11.59C25.1733 11.671 25.2026 11.7485 25.2461 11.8181C25.2896 11.8877 25.3465 11.948 25.4134 11.9955C25.4804 12.0429 25.5561 12.0766 25.6362 12.0945C25.7163 12.1125 25.7992 12.1143 25.88 12.1C25.9616 12.088 26.0399 12.0596 26.1102 12.0164C26.1805 11.9733 26.2413 11.9164 26.289 11.8491C26.3367 11.7818 26.3702 11.7055 26.3876 11.6249C26.4049 11.5443 26.4057 11.461 26.39 11.38C25.9044 8.36982 24.3706 5.6281 22.0596 3.63911C19.7485 1.65012 16.8089 0.541828 13.76 0.510002H13.57C10.1222 0.510002 6.81559 1.87964 4.37761 4.31761C1.93964 6.75559 0.57 10.0622 0.57 13.51C0.57 16.9578 1.93964 20.2644 4.37761 22.7024C6.81559 25.1404 10.1222 26.51 13.57 26.51H13.8C15.7381 26.4783 17.6447 26.0137 19.38 25.15C19.4555 25.1132 19.523 25.062 19.5787 24.9991C19.6344 24.9362 19.6772 24.863 19.7046 24.7836C19.732 24.7042 19.7435 24.6202 19.7384 24.5364C19.7333 24.4525 19.7118 24.3705 19.675 24.295C19.6382 24.2195 19.5869 24.152 19.5241 24.0963C19.4612 24.0406 19.388 23.9978 19.3086 23.9704C19.2292 23.943 19.1452 23.9315 19.0614 23.9366C18.9775 23.9417 18.8955 23.9632 18.82 24C18.0186 24.4035 17.1729 24.7123 16.3 24.92C17.6659 22.8192 18.4968 20.4159 18.72 17.92H20.06C20.2121 17.9007 20.352 17.8266 20.4534 17.7115C20.5548 17.5965 20.6108 17.4484 20.6108 17.295C20.6108 17.1416 20.5548 16.9935 20.4534 16.8785C20.352 16.7634 20.2121 16.6893 20.06 16.67V16.69ZM17.77 13.5C17.77 14.63 17.71 15.69 17.61 16.69H9.76C9.65001 15.6302 9.59327 14.5655 9.59 13.5C9.59 12.38 9.66 11.31 9.76 10.31H17.61C17.71 11.31 17.77 12.38 17.77 13.5ZM13.66 1.76H13.73C15.2 1.82 16.79 4.65 17.45 9.06H9.92C10.58 4.63 12.18 1.79 13.66 1.76ZM24.44 9.06H18.72C18.495 6.566 17.668 4.16389 16.31 2.06C18.1262 2.49148 19.8124 3.35236 21.2271 4.57038C22.6417 5.78841 23.7435 7.32803 24.44 9.06V9.06ZM11.1 2C9.72456 4.09855 8.88344 6.50175 8.65 9H2.7C3.43006 7.24114 4.57565 5.68549 6.03862 4.46635C7.50159 3.2472 9.23832 2.40092 11.1 2V2ZM2.27 10.29H8.5C8.4 11.29 8.34 12.37 8.34 13.48C8.34 14.59 8.4 15.65 8.5 16.67H2.27C1.6699 14.5857 1.6699 12.3743 2.27 10.29V10.29ZM2.7 17.92H8.65C8.88344 20.4183 9.72456 22.8214 11.1 24.92C9.24039 24.5211 7.50502 23.6778 6.04222 22.4623C4.57941 21.2468 3.43267 19.6951 2.7 17.94V17.92ZM13.75 25.22H13.65C12.18 25.22 10.58 22.35 9.92 17.92H17.45C16.79 22.33 15.22 25.15 13.75 25.24V25.22Z"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  d: "M30.43 19.15H30.18V17.28C30.18 16.3067 29.7933 15.3732 29.1051 14.6849C28.4168 13.9967 27.4833 13.61 26.51 13.61C25.5367 13.61 24.6032 13.9967 23.9149 14.6849C23.2267 15.3732 22.84 16.3067 22.84 17.28V19.15H22.59C22.2204 19.1526 21.8669 19.3013 21.6065 19.5636C21.3461 19.8258 21.2 20.1804 21.2 20.55V26.72C21.2 27.0887 21.3464 27.4422 21.6071 27.7029C21.8678 27.9636 22.2213 28.11 22.59 28.11H30.46C30.8286 28.11 31.1822 27.9636 31.4429 27.7029C31.7036 27.4422 31.85 27.0887 31.85 26.72V20.55C31.85 20.3645 31.8132 20.1808 31.7416 20.0096C31.6699 19.8384 31.565 19.6832 31.4329 19.5529C31.3008 19.4226 31.1441 19.3199 30.9719 19.2508C30.7997 19.1816 30.6155 19.1473 30.43 19.15V19.15ZM24.07 17.29C24.07 16.6482 24.325 16.0326 24.7788 15.5788C25.2326 15.125 25.8482 14.87 26.49 14.87C27.1318 14.87 27.7474 15.125 28.2012 15.5788C28.655 16.0326 28.91 16.6482 28.91 17.29V19.15H24.06L24.07 17.29ZM30.57 26.72C30.57 26.7571 30.5553 26.7927 30.529 26.819C30.5027 26.8453 30.4671 26.86 30.43 26.86H22.56C22.5416 26.86 22.5234 26.8564 22.5064 26.8493C22.4894 26.8423 22.474 26.832 22.461 26.819C22.448 26.806 22.4377 26.7906 22.4307 26.7736C22.4236 26.7566 22.42 26.7384 22.42 26.72V20.55C22.4199 20.5119 22.4343 20.4752 22.4603 20.4473C22.4863 20.4195 22.522 20.4025 22.56 20.4H30.43C30.468 20.4025 30.5037 20.4195 30.5297 20.4473C30.5557 20.4752 30.5701 20.5119 30.57 20.55V26.72Z"
})));
OnlineSecurity.displayName = "DecorativeIcon";

const LWC = props => /*#__PURE__*/React.createElement(SVGIcon, props, /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "25",
  viewBox: "0 0 24 25",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg"
}, /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M10.4492 21.28C10.5634 21.4702 10.5018 21.7169 10.3117 21.8311C9.85723 22.104 9.53176 22.8221 9.50225 23.709C9.49487 23.9307 9.30918 24.1045 9.08749 24.0971C8.8658 24.0897 8.69207 23.904 8.69945 23.6823C8.73258 22.6865 9.0979 21.623 9.89814 21.1425C10.0883 21.0283 10.335 21.0898 10.4492 21.28Z",
  fill: "#4B286D"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M5.16066 3.63158C5.6407 3.39276 6.15481 3.21301 6.69037 3.21301C7.19911 3.21301 7.82061 3.35317 8.44185 3.54459C9.07076 3.73837 9.73149 3.99503 10.3295 4.24903C10.9285 4.50342 11.4701 4.75746 11.8616 4.94776C12.0576 5.04298 12.2164 5.12243 12.3264 5.17823C12.3815 5.20614 12.4244 5.22814 12.4537 5.24325L12.4873 5.26064L12.4961 5.26524L12.4993 5.26692C12.4994 5.26695 12.4994 5.26697 12.3131 5.62275L12.4993 5.26692C12.6958 5.36983 12.7718 5.61261 12.6689 5.8091C12.566 6.00558 12.3233 6.08143 12.1268 5.97853C12.1268 5.97853 12.1268 5.97854 12.1268 5.97853L12.1245 5.97735L12.1168 5.97333L12.0855 5.95714C12.0578 5.94284 12.0166 5.9217 11.9633 5.89469C11.8567 5.84067 11.702 5.76324 11.5105 5.6702C11.1274 5.48398 10.5986 5.236 10.0155 4.98836C9.43152 4.74032 8.79837 4.49495 8.20532 4.31222C7.6046 4.12712 7.07605 4.01626 6.69037 4.01626C6.33153 4.01626 5.94661 4.13773 5.51845 4.35074C5.11172 4.55308 4.69775 4.82111 4.25371 5.10861C4.22904 5.12458 4.20428 5.14061 4.17943 5.1567C3.7097 5.46063 3.19882 5.79015 2.65649 6.03726C3.15285 6.15826 3.76155 6.29587 4.46174 6.43354C6.48718 6.83178 9.27157 7.22924 12.3131 7.22924C12.5349 7.22924 12.7147 7.40905 12.7147 7.63086C12.7147 7.85267 12.5349 8.03248 12.3131 8.03248C9.20497 8.03248 6.36664 7.6267 4.30677 7.22169C3.27619 7.01906 2.43883 6.8163 1.858 6.66385C1.56755 6.58762 1.34114 6.52394 1.18668 6.47911C1.10945 6.45669 1.05019 6.43898 1.0099 6.42677L0.96381 6.41267L0.951662 6.4089L0.948353 6.40787L0.947394 6.40756C0.947291 6.40753 0.946902 6.40741 1.06766 6.02437L0.947394 6.40756C0.758345 6.34797 0.640558 6.1592 0.670709 5.96328C0.700859 5.76737 0.869436 5.62275 1.06766 5.62275C1.93168 5.62275 2.78804 5.10025 3.74307 4.48231C3.77163 4.46383 3.80027 4.44528 3.82899 4.42668C4.26157 4.14648 4.7116 3.85498 5.16066 3.63158Z",
  fill: "#4B286D"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M12.3138 5.62275L12.0919 5.28795C11.907 5.41047 11.8565 5.65968 11.979 5.84459C12.1015 6.02947 12.3507 6.08005 12.5356 5.95758L12.5371 5.95657L12.5429 5.95275L12.5671 5.93696C12.5887 5.92294 12.621 5.90209 12.663 5.87538C12.747 5.82196 12.8697 5.74519 13.0227 5.65287C13.3292 5.46801 13.7555 5.22188 14.2356 4.97624C14.7167 4.7301 15.2458 4.48755 15.7587 4.30731C16.277 4.12517 16.7522 4.01626 17.1332 4.01626C17.4987 4.01626 17.9384 4.14142 18.4519 4.36055C18.9342 4.56635 19.445 4.83835 19.9824 5.12456C20.0133 5.14101 20.0442 5.15751 20.0753 5.17404C20.639 5.47405 21.2295 5.78508 21.8085 6.02001C21.8378 6.0319 21.8672 6.04362 21.8966 6.05517C21.4141 6.17175 20.831 6.30262 20.1651 6.43354C18.1397 6.83178 15.3553 7.22924 12.3138 7.22924C12.092 7.22924 11.9122 7.40905 11.9122 7.63086C11.9122 7.85267 12.092 8.03248 12.3138 8.03248C15.4219 8.03248 18.2602 7.6267 20.3201 7.22169C21.3507 7.01906 22.188 6.8163 22.7689 6.66385C23.0593 6.58762 23.2857 6.52394 23.4402 6.47911C23.5174 6.45669 23.5767 6.43898 23.617 6.42677L23.6631 6.41267L23.6752 6.4089L23.6785 6.40787L23.6795 6.40756C23.6796 6.40753 23.68 6.40741 23.5592 6.02437L23.6795 6.40756C23.8685 6.34797 23.9863 6.1592 23.9562 5.96328C23.926 5.76737 23.7574 5.62275 23.5592 5.62275C23.1322 5.62275 22.6471 5.49339 22.1105 5.27569C21.5759 5.0588 21.0209 4.76739 20.4527 4.46497C20.4186 4.4468 20.3844 4.42858 20.3501 4.41034C19.8222 4.12915 19.2826 3.84169 18.7672 3.62176C18.2219 3.38906 17.6622 3.21301 17.1332 3.21301C16.6199 3.21301 16.0455 3.35512 15.4924 3.5495C14.9339 3.74578 14.3699 4.00525 13.8698 4.26115C13.3687 4.51753 12.9255 4.77343 12.6078 4.96509C12.4488 5.06103 12.3207 5.14115 12.232 5.19754C12.1876 5.22575 12.1531 5.24804 12.1294 5.26343L12.1021 5.28123L12.0949 5.28602L12.0928 5.28735L12.0919 5.28795C12.0919 5.288 12.0919 5.28795 12.3138 5.62275Z",
  fill: "#4B286D"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M12.3137 7.22913C12.5355 7.22913 12.7154 7.40894 12.7154 7.63075V23.6957C12.7154 23.9175 12.5355 24.0973 12.3137 24.0973C12.0919 24.0973 11.9121 23.9175 11.9121 23.6957V7.63075C11.9121 7.40894 12.0919 7.22913 12.3137 7.22913Z",
  fill: "#4B286D"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M14.8734 9.89643C14.8685 9.92199 14.8607 10.0104 15.0085 10.1582C15.3176 10.4673 15.5162 10.7879 15.5863 11.1299C15.6578 11.478 15.586 11.798 15.4468 12.082C15.4367 12.1025 15.4262 12.1229 15.4154 12.1432C15.7376 11.9391 16.0018 11.7185 16.1881 11.4906C16.4042 11.2263 16.4948 10.9784 16.4859 10.7491C16.4772 10.5222 16.3683 10.2443 16.047 9.92298C15.7052 9.58123 15.2817 9.58804 15.0412 9.71746C14.9201 9.78263 14.8811 9.85671 14.8734 9.89643ZM14.051 13.6338C15.1651 13.2793 16.2228 12.7175 16.81 11.999C17.1102 11.6317 17.3071 11.1982 17.2886 10.7182C17.27 10.2359 17.0367 9.77671 16.615 9.355C16.0145 8.75456 15.2035 8.71803 14.6606 9.01011C14.3901 9.15569 14.1502 9.40517 14.0847 9.74415C14.0166 10.0973 14.157 10.4427 14.4405 10.7262C14.6784 10.9641 14.7706 11.1508 14.7995 11.2914C14.8271 11.4259 14.8062 11.5639 14.7256 11.7283C14.6412 11.9004 14.4986 12.0861 14.3025 12.2988C14.1629 12.4502 14.0109 12.6001 13.8473 12.7615C13.7812 12.8267 13.7132 12.8937 13.6433 12.9635C13.6295 12.9768 13.6167 12.991 13.605 13.006C13.5355 13.0949 13.5045 13.2116 13.5265 13.3279C13.5353 13.3748 13.5525 13.4204 13.578 13.4623C13.6035 13.5043 13.6361 13.5405 13.6736 13.5698C13.7625 13.6393 13.8793 13.6704 13.9956 13.6483C14.0113 13.6453 14.027 13.6414 14.0427 13.6364C14.0455 13.6355 14.0482 13.6347 14.051 13.6338Z",
  fill: "#4B286D"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M10.0879 9.7734C10.0316 9.45899 9.80816 9.22582 9.55184 9.08849C9.03824 8.81331 8.26128 8.84104 7.66833 9.39534C7.39134 9.65449 7.20376 9.93784 7.1106 10.2428C7.01699 10.5493 7.02507 10.8567 7.10707 11.1519C7.26734 11.729 7.70989 12.2629 8.24061 12.724C9.30901 13.6523 10.8934 14.4212 12.0122 14.776C12.0794 14.7973 12.1483 14.7963 12.2109 14.777C12.3522 14.8376 12.5312 14.9059 12.7252 14.9799L12.8327 15.021C13.0872 15.1184 13.3702 15.2284 13.658 15.3544C14.2412 15.6095 14.8118 15.9163 15.1915 16.2844C15.5604 16.642 15.7135 17.0165 15.5825 17.4582C15.4386 17.9435 14.9327 18.591 13.7333 19.4034C13.5809 19.5067 13.5411 19.714 13.6443 19.8664C13.7476 20.0188 13.9548 20.0586 14.1073 19.9554C15.3398 19.1204 16.0098 18.3621 16.2217 17.6478C16.4465 16.8899 16.1353 16.2709 15.6555 15.8057C15.1864 15.3509 14.5239 15.0055 13.9253 14.7436C13.6222 14.611 13.3271 14.4963 13.0709 14.3983L12.9603 14.3561C12.7499 14.2758 12.5771 14.2098 12.4478 14.1531C12.0323 13.9705 11.4982 13.6821 10.992 13.333C10.6401 13.0903 10.3016 12.8183 10.0258 12.5321C9.6878 12.1815 9.47532 11.8417 9.41553 11.5376C9.40979 11.5084 9.40537 11.4791 9.40241 11.4497C9.37742 11.2018 9.45707 10.9475 9.73328 10.6826C10.0088 10.4181 10.1462 10.0993 10.0879 9.7734ZM8.09908 9.90567C7.90536 10.093 7.79874 10.2721 7.74818 10.4376C7.69597 10.6085 7.69721 10.7855 7.74942 10.9735C7.85759 11.363 8.18304 11.7908 8.67787 12.2208C8.85936 12.3785 9.05838 12.532 9.26892 12.6795C9.02263 12.3686 8.83231 12.027 8.76138 11.6662C8.70298 11.3691 8.72865 11.0746 8.84883 10.7939C8.93724 10.5875 9.07678 10.3885 9.27163 10.2016C9.43617 10.0436 9.43987 9.93695 9.43162 9.89082C9.42131 9.8332 9.37066 9.74774 9.23699 9.67612C8.97066 9.53343 8.50416 9.52666 8.1236 9.88235C8.11527 9.89013 8.1071 9.89791 8.09908 9.90567Z",
  fill: "#4B286D"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M10.255 15.4672C10.3633 15.6608 10.2942 15.9055 10.1006 16.0138C9.50059 16.3494 9.0363 16.6913 8.74958 17.025C8.46573 17.3555 8.3949 17.6276 8.45414 17.8659C8.51898 18.1268 8.76838 18.4746 9.41745 18.8757C10.0581 19.2715 11.0313 19.6837 12.4284 20.0977C14.2082 20.625 15.104 21.4877 15.542 22.2695C15.758 22.6552 15.8553 23.0085 15.8981 23.27C15.9195 23.4008 15.9273 23.5089 15.9296 23.5872C15.9308 23.6264 15.9305 23.6583 15.9298 23.682C15.9295 23.6938 15.9291 23.7036 15.9287 23.7112L15.9281 23.7211L15.9278 23.7248L15.9277 23.7263C15.9277 23.7266 15.9276 23.7276 15.5272 23.6957L15.9276 23.7276C15.91 23.9487 15.7165 24.1137 15.4953 24.0961C15.2754 24.0786 15.111 23.887 15.1266 23.6674M15.1266 23.6674L15.1267 23.6659L15.1268 23.6651M15.1266 23.6674L15.1269 23.6594C15.1272 23.6502 15.1274 23.6337 15.1267 23.6105C15.1254 23.5641 15.1205 23.4918 15.1054 23.3998C15.0753 23.2158 15.0048 22.9541 14.8412 22.662C14.5198 22.0884 13.8092 21.3446 12.2002 20.8678C10.7714 20.4444 9.72193 20.0081 8.99521 19.559C8.27693 19.1152 7.8143 18.6217 7.67461 18.0597C7.52933 17.4751 7.76147 16.9426 8.14027 16.5016C8.51621 16.064 9.07425 15.6675 9.70844 15.3128C9.90202 15.2045 10.1467 15.2736 10.255 15.4672",
  fill: "#4B286D"
}), /*#__PURE__*/React.createElement("path", {
  fillRule: "evenodd",
  clipRule: "evenodd",
  d: "M12.3133 0.803245C11.2041 0.803245 10.3052 1.70219 10.3052 2.81136C10.3052 3.92053 11.2041 4.81947 12.3133 4.81947C13.4225 4.81947 14.3214 3.92053 14.3214 2.81136C14.3214 1.70219 13.4225 0.803245 12.3133 0.803245ZM9.50195 2.81136C9.50195 1.25857 10.7605 0 12.3133 0C13.8661 0 15.1247 1.25857 15.1247 2.81136C15.1247 4.36415 13.8661 5.62272 12.3133 5.62272C10.7605 5.62272 9.50195 4.36415 9.50195 2.81136Z",
  fill: "#4B286D"
})));
LWC.displayName = "DecorativeIcon";

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Accessible: Accessible,
  AddUser: AddUser,
  AlarmClock: AlarmClock,
  Ambulance: Ambulance,
  AppleWatch: AppleWatch,
  ArrowDown: ArrowDown,
  ArrowUp: ArrowUp,
  ArtificialIntelligence: ArtificialIntelligence,
  Attention: Attention,
  AutomaticFallDetection: AutomaticFallDetection,
  Award: Award,
  Baby: Baby,
  BabyBoy: BabyBoy,
  BabyGirl: BabyGirl,
  BackToSchool: BackToSchool,
  Bank: Bank,
  BatteryCar: BatteryCar,
  BatteryCharging: BatteryCharging,
  Bell: Bell,
  Bill: Bill,
  Bookmark: Bookmark,
  Briefcase: Briefcase,
  Calendar: Calendar,
  Call: Call,
  CallForward: CallForward,
  CallOut: CallOut,
  CallReceive: CallReceive,
  CallTalking: CallTalking,
  Camera: Camera,
  Car: Car,
  CartTeam: CartTeam,
  Channels: Channels,
  ChartsBar1: ChartsBar1,
  ChartsBar2: ChartsBar2,
  ChartsLine: ChartsLine,
  Chat1: Chat1,
  Chat2: Chat2,
  ChatSupport: ChatSupport,
  Check: Check,
  Clipboard: Clipboard,
  CloudDownload: CloudDownload,
  CloudSync: CloudSync,
  CloudUpload: CloudUpload,
  Collaboration: Collaboration,
  Compass: Compass,
  ComputerNetwork: ComputerNetwork,
  Contract: Contract,
  CreditCard: CreditCard,
  Cronometer: Cronometer,
  CssActivations: CssActivations,
  DataLimit: DataLimit,
  Deals: Deals,
  Delivery: Delivery,
  Devices: Devices,
  Diagram: Diagram,
  Diamond: Diamond,
  Direction: Direction,
  Document: Document,
  Donate: Donate,
  Download: Download,
  Email: Email,
  Escalations: Escalations,
  FavouriteNetwork: FavouriteNetwork,
  Files: Files,
  Fingerprint: Fingerprint,
  Firewall: Firewall,
  Flag: Flag,
  Gift: Gift,
  Globe1: Globe1,
  Globe2: Globe2,
  HeadBoth: HeadBoth,
  HeadFemale: HeadFemale,
  HeadMale: HeadMale,
  Headset: Headset,
  Heart: Heart,
  Heartbeat: Heartbeat,
  Helpdesk: Helpdesk,
  Home: Home,
  HomeSecurity: Warranty$1,
  IdTag: IdTag,
  Infinite: Infinite,
  Information: Information,
  Internet: Internet,
  Invisible: Invisible,
  Key: Key,
  LWC: LWC,
  Laptop: Laptop,
  Layers: Layers,
  Lifesaver: Lifesaver,
  Lightbulb: Lightbulb,
  LocationAdd: LocationAdd,
  LocationHome: LocationHome,
  LocationMap: LocationMap,
  LocationRegular: LocationRegular,
  LocationRemove: LocationRemove,
  LocationVerified: LocationVerified,
  LockClosed: LockClosed,
  LockOpened: LockOpened,
  Login: Login$1,
  LoginForm: LoginForm,
  Map: Map$1,
  Medical: Medical,
  Messaging: Messaging,
  Microphone: Microphone,
  Mobility: Mobility,
  Movie: Movie,
  Music: Music,
  Networking: Networking,
  News: News,
  NextGenFirewall: NextGenFirewall,
  NoContract: NoContract,
  Office: Office,
  Offices: Offices,
  OnDemand: OnDemand,
  OnTheGo: OnTheGo,
  OnlineSecurity: OnlineSecurity,
  Paperless: Paperless,
  Passport: Passport,
  Phone: Phone,
  PhoneBusiness: PhoneBusiness,
  PhoneHome: PhoneHome,
  PhoneReception: PhoneReception,
  Photo: Photo,
  Photos: Photos,
  PiggyBank: PiggyBank,
  PikTV: PikTV,
  Play: Play,
  Preference: Preference,
  PrivateCloud: PrivateCloud,
  ProactiveAssurance: ProactiveAssurance,
  Radar: Radar,
  Receipt: Receipt,
  Record: Record,
  Refresh: Refresh,
  RemoteControl: RemoteControl,
  Router: Router,
  Sales: Sales,
  SecurityCamera: SecurityCamera,
  SecurityHouse: SecurityHouse,
  SecurityMobile: SecurityMobile,
  SecuritySettings: SecuritySettings,
  Server: Server,
  ServiceTruck: ServiceTruck,
  Settings: Settings,
  SharedAccount: SharedAccount,
  Shop: Shop,
  SignPost: SignPost,
  Signal: Signal,
  SimCard: SimCard,
  Soccer: Soccer,
  Speaker: Speaker,
  SpeakerPhone: SpeakerPhone,
  Speed: Speed,
  SpeedReduced: SpeedReduced,
  Success: Success,
  Suitcase: Suitcase,
  Support: Support,
  TVChoiceAndFlexibility: TVChoiceAndFlexibility,
  Tablet: Tablet,
  Target: Target,
  Tasks: Tasks,
  ThumbsUp: ThumbsUp,
  Time: Time,
  TowTruck: TowTruck,
  Transmitter: Transmitter,
  Tv: Tv,
  TwoWayVoiceCall: TwoWayVoiceCall,
  Umbrella: Umbrella,
  Upload: Upload,
  UploadToCloud: UploadToCloud,
  UsbCable: UsbCable,
  User: User,
  Users: Users,
  VideoChat: VideoChat,
  VideoGames: VideoGames,
  Visible: Visible,
  Warranty: Warranty,
  Watch: Watch,
  WebstoreTeam: WebstoreTeam,
  WifiBoost: WifiBoost,
  WifiCloud: WifiCloud
});

const StyledDimpleDivider = styled.hr(noSpacing, none, {
  height: "32px",
  backgroundImage: "radial-gradient(ellipse at top, rgba(150, 150, 150, 0.1) 0%, rgba(0, 0, 0, 0) 70%)"
});
const DimpleDivider = ({
  ...rest
}) => /*#__PURE__*/React.createElement(StyledDimpleDivider, safeRest(rest));

const Responsive = ({
  minWidth,
  maxWidth,
  query,
  children,
  ...rest
}) => {
  if (!minWidth && !maxWidth) {
    warn("Responsive", "Responsive needs a minWidth or maxWith prop");
  }
  const mediaQuery = {};
  if (minWidth) {
    mediaQuery.minWidth = breakpoints[minWidth];
  }
  if (maxWidth) {
    mediaQuery.maxWidth = breakpoints[maxWidth] - 1;
  }
  return /*#__PURE__*/React.createElement(Media, _extends$1({}, rest, {
    query: {
      ...mediaQuery,
      ...query
    }
  }), children);
};
Responsive.propTypes = {
  minWidth: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  maxWidth: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  query: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
};
Responsive.defaultProps = {
  minWidth: undefined,
  maxWidth: undefined,
  query: {},
  children: undefined
};

const viewports = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl"
};
viewports.map = new Map([[viewports.xs, 0], [viewports.sm, 576], [viewports.md, 768], [viewports.lg, 992], [viewports.xl, 1200]]);
viewports.values = Array.from(viewports.map.values());
viewports.keys = Array.from(viewports.map.keys());
const viewportsSortedDescending = Array.from(viewports.map.entries()).reverse();

// The largest viewport such that the given width is still >= the breakpoint
viewports.select = (width = 0) => {
  if (!Number.isFinite(+width) || width < 0) {
    throw new Error(`width must be a non-negative number, received: ${width}`);
  }
  return viewportsSortedDescending.find(([, min]) => width >= min)[0];
};
const inherit = ({
  xs,
  sm = xs,
  md = sm,
  lg = md,
  xl = lg
}) => ({
  xs,
  sm,
  md,
  lg,
  xl
});
viewports.inherit = inherit;
const fromArray = viewportsArray => ({
  xs: viewportsArray[0],
  sm: viewportsArray[1],
  md: viewportsArray[2],
  lg: viewportsArray[3],
  xl: viewportsArray[4]
});
viewports.fromArray = fromArray;

const StyledDisplayHeading = styled.h1(noSpacing, wordBreak, helveticaNeueThin35, ({
  invert
}) => ({
  color: invert ? colorWhite : colorSecondary,
  fontSize: "2.75rem",
  lineHeight: 1.14,
  ...media.from("md").css({
    fontSize: "4.5rem",
    lineHeight: "1.11",
    letterSpacing: "0.2px"
  })
}), {
  sup: {
    ...baseSupSubScripts,
    fontSize: "1.25rem",
    top: "-1.2em",
    ...media.from("md").css({
      top: "-2.2em"
    })
  }
});
const DisplayHeading = ({
  invert,
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(StyledDisplayHeading, _extends$1({}, safeRest(rest), {
  invert: invert
}), children);
DisplayHeading.propTypes = {
  /**
   * Invert the text color to appear light on dark backgrounds.
   */
  invert: PropTypes.bool,
  /**
   * The text. Can be text, other components, or HTML elements.
   */
  children: PropTypes.node.isRequired
};
DisplayHeading.defaultProps = {
  invert: false
};

const baseStyle = {
  transform: "rotate(-0.00001deg)",
  flexShrink: 0
};
const horizontalStyle = {
  ...baseStyle,
  width: "100%",
  height: "1px"
};
const verticalStyle = {
  ...baseStyle,
  display: "inline-block",
  width: "1px"
};
const StyledHairlineDivider = styled.hr(noSpacing, none, props => {
  if (props.vertical && props.gradient) {
    return {
      ...verticalStyle,
      "background-image": `
        linear-gradient(0deg, rgba(216, 216, 216, 0) 0%,
        ${colorGreyGainsboro} 12%,
        ${colorGreyGainsboro} 88%,
        rgba(216, 216, 216, 0) 100%)
      `
    };
  }
  if (props.vertical && !props.gradient) {
    return {
      ...verticalStyle,
      "background-color": colorGreyGainsboro
    };
  }
  if (!props.vertical && props.gradient) {
    return {
      ...horizontalStyle,
      "background-image": `
        linear-gradient(90deg, rgba(216, 216, 216, 0) 0%,
        ${colorGreyGainsboro} 7%,
        ${colorGreyGainsboro} 93%,
        rgba(216, 216, 216, 0) 100%)
      `
    };
  }
  return {
    ...horizontalStyle,
    "background-color": colorGreyGainsboro
  };
});
const HairlineDivider = ({
  vertical,
  gradient,
  ...rest
}) => /*#__PURE__*/React.createElement(StyledHairlineDivider, _extends$1({}, safeRest(rest), {
  vertical: vertical,
  gradient: gradient
}));
HairlineDivider.propTypes = {
  vertical: PropTypes.bool,
  gradient: PropTypes.bool
};
HairlineDivider.defaultProps = {
  vertical: false,
  gradient: false
};

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}

/**
 * Checks if a given element has a CSS class.
 * 
 * @param element the element
 * @param className the CSS class name
 */
function hasClass(element, className) {
  if (element.classList) return !!className && element.classList.contains(className);
  return (" " + (element.className.baseVal || element.className) + " ").indexOf(" " + className + " ") !== -1;
}

/**
 * Adds a CSS class to a given element.
 * 
 * @param element the element
 * @param className the CSS class name
 */

function addClass(element, className) {
  if (element.classList) element.classList.add(className);else if (!hasClass(element, className)) if (typeof element.className === 'string') element.className = element.className + " " + className;else element.setAttribute('class', (element.className && element.className.baseVal || '') + " " + className);
}

function replaceClassName(origClass, classToRemove) {
  return origClass.replace(new RegExp("(^|\\s)" + classToRemove + "(?:\\s|$)", 'g'), '$1').replace(/\s+/g, ' ').replace(/^\s*|\s*$/g, '');
}
/**
 * Removes a CSS class from a given element.
 * 
 * @param element the element
 * @param className the CSS class name
 */


function removeClass$1(element, className) {
  if (element.classList) {
    element.classList.remove(className);
  } else if (typeof element.className === 'string') {
    element.className = replaceClassName(element.className, className);
  } else {
    element.setAttribute('class', replaceClassName(element.className && element.className.baseVal || '', className));
  }
}

var config = {
  disabled: false
};

var timeoutsShape = process.env.NODE_ENV !== 'production' ? PropTypes.oneOfType([PropTypes.number, PropTypes.shape({
  enter: PropTypes.number,
  exit: PropTypes.number,
  appear: PropTypes.number
}).isRequired]) : null;
var classNamesShape = process.env.NODE_ENV !== 'production' ? PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
  enter: PropTypes.string,
  exit: PropTypes.string,
  active: PropTypes.string
}), PropTypes.shape({
  enter: PropTypes.string,
  enterDone: PropTypes.string,
  enterActive: PropTypes.string,
  exit: PropTypes.string,
  exitDone: PropTypes.string,
  exitActive: PropTypes.string
})]) : null;

var TransitionGroupContext = React.createContext(null);

var forceReflow = function forceReflow(node) {
  return node.scrollTop;
};

var UNMOUNTED = 'unmounted';
var EXITED = 'exited';
var ENTERING = 'entering';
var ENTERED = 'entered';
var EXITING = 'exiting';
/**
 * The Transition component lets you describe a transition from one component
 * state to another _over time_ with a simple declarative API. Most commonly
 * it's used to animate the mounting and unmounting of a component, but can also
 * be used to describe in-place transition states as well.
 *
 * ---
 *
 * **Note**: `Transition` is a platform-agnostic base component. If you're using
 * transitions in CSS, you'll probably want to use
 * [`CSSTransition`](https://reactcommunity.org/react-transition-group/css-transition)
 * instead. It inherits all the features of `Transition`, but contains
 * additional features necessary to play nice with CSS transitions (hence the
 * name of the component).
 *
 * ---
 *
 * By default the `Transition` component does not alter the behavior of the
 * component it renders, it only tracks "enter" and "exit" states for the
 * components. It's up to you to give meaning and effect to those states. For
 * example we can add styles to a component when it enters or exits:
 *
 * ```jsx
 * import { Transition } from 'react-transition-group';
 *
 * const duration = 300;
 *
 * const defaultStyle = {
 *   transition: `opacity ${duration}ms ease-in-out`,
 *   opacity: 0,
 * }
 *
 * const transitionStyles = {
 *   entering: { opacity: 1 },
 *   entered:  { opacity: 1 },
 *   exiting:  { opacity: 0 },
 *   exited:  { opacity: 0 },
 * };
 *
 * const Fade = ({ in: inProp }) => (
 *   <Transition in={inProp} timeout={duration}>
 *     {state => (
 *       <div style={{
 *         ...defaultStyle,
 *         ...transitionStyles[state]
 *       }}>
 *         I'm a fade Transition!
 *       </div>
 *     )}
 *   </Transition>
 * );
 * ```
 *
 * There are 4 main states a Transition can be in:
 *  - `'entering'`
 *  - `'entered'`
 *  - `'exiting'`
 *  - `'exited'`
 *
 * Transition state is toggled via the `in` prop. When `true` the component
 * begins the "Enter" stage. During this stage, the component will shift from
 * its current transition state, to `'entering'` for the duration of the
 * transition and then to the `'entered'` stage once it's complete. Let's take
 * the following example (we'll use the
 * [useState](https://reactjs.org/docs/hooks-reference.html#usestate) hook):
 *
 * ```jsx
 * function App() {
 *   const [inProp, setInProp] = useState(false);
 *   return (
 *     <div>
 *       <Transition in={inProp} timeout={500}>
 *         {state => (
 *           // ...
 *         )}
 *       </Transition>
 *       <button onClick={() => setInProp(true)}>
 *         Click to Enter
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * When the button is clicked the component will shift to the `'entering'` state
 * and stay there for 500ms (the value of `timeout`) before it finally switches
 * to `'entered'`.
 *
 * When `in` is `false` the same thing happens except the state moves from
 * `'exiting'` to `'exited'`.
 */

var Transition = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(Transition, _React$Component);

  function Transition(props, context) {
    var _this;

    _this = _React$Component.call(this, props, context) || this;
    var parentGroup = context; // In the context of a TransitionGroup all enters are really appears

    var appear = parentGroup && !parentGroup.isMounting ? props.enter : props.appear;
    var initialStatus;
    _this.appearStatus = null;

    if (props.in) {
      if (appear) {
        initialStatus = EXITED;
        _this.appearStatus = ENTERING;
      } else {
        initialStatus = ENTERED;
      }
    } else {
      if (props.unmountOnExit || props.mountOnEnter) {
        initialStatus = UNMOUNTED;
      } else {
        initialStatus = EXITED;
      }
    }

    _this.state = {
      status: initialStatus
    };
    _this.nextCallback = null;
    return _this;
  }

  Transition.getDerivedStateFromProps = function getDerivedStateFromProps(_ref, prevState) {
    var nextIn = _ref.in;

    if (nextIn && prevState.status === UNMOUNTED) {
      return {
        status: EXITED
      };
    }

    return null;
  } // getSnapshotBeforeUpdate(prevProps) {
  //   let nextStatus = null
  //   if (prevProps !== this.props) {
  //     const { status } = this.state
  //     if (this.props.in) {
  //       if (status !== ENTERING && status !== ENTERED) {
  //         nextStatus = ENTERING
  //       }
  //     } else {
  //       if (status === ENTERING || status === ENTERED) {
  //         nextStatus = EXITING
  //       }
  //     }
  //   }
  //   return { nextStatus }
  // }
  ;

  var _proto = Transition.prototype;

  _proto.componentDidMount = function componentDidMount() {
    this.updateStatus(true, this.appearStatus);
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    var nextStatus = null;

    if (prevProps !== this.props) {
      var status = this.state.status;

      if (this.props.in) {
        if (status !== ENTERING && status !== ENTERED) {
          nextStatus = ENTERING;
        }
      } else {
        if (status === ENTERING || status === ENTERED) {
          nextStatus = EXITING;
        }
      }
    }

    this.updateStatus(false, nextStatus);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.cancelNextCallback();
  };

  _proto.getTimeouts = function getTimeouts() {
    var timeout = this.props.timeout;
    var exit, enter, appear;
    exit = enter = appear = timeout;

    if (timeout != null && typeof timeout !== 'number') {
      exit = timeout.exit;
      enter = timeout.enter; // TODO: remove fallback for next major

      appear = timeout.appear !== undefined ? timeout.appear : enter;
    }

    return {
      exit: exit,
      enter: enter,
      appear: appear
    };
  };

  _proto.updateStatus = function updateStatus(mounting, nextStatus) {
    if (mounting === void 0) {
      mounting = false;
    }

    if (nextStatus !== null) {
      // nextStatus will always be ENTERING or EXITING.
      this.cancelNextCallback();

      if (nextStatus === ENTERING) {
        if (this.props.unmountOnExit || this.props.mountOnEnter) {
          var node = this.props.nodeRef ? this.props.nodeRef.current : ReactDOM.findDOMNode(this); // https://github.com/reactjs/react-transition-group/pull/749
          // With unmountOnExit or mountOnEnter, the enter animation should happen at the transition between `exited` and `entering`.
          // To make the animation happen,  we have to separate each rendering and avoid being processed as batched.

          if (node) forceReflow(node);
        }

        this.performEnter(mounting);
      } else {
        this.performExit();
      }
    } else if (this.props.unmountOnExit && this.state.status === EXITED) {
      this.setState({
        status: UNMOUNTED
      });
    }
  };

  _proto.performEnter = function performEnter(mounting) {
    var _this2 = this;

    var enter = this.props.enter;
    var appearing = this.context ? this.context.isMounting : mounting;

    var _ref2 = this.props.nodeRef ? [appearing] : [ReactDOM.findDOMNode(this), appearing],
        maybeNode = _ref2[0],
        maybeAppearing = _ref2[1];

    var timeouts = this.getTimeouts();
    var enterTimeout = appearing ? timeouts.appear : timeouts.enter; // no enter animation skip right to ENTERED
    // if we are mounting and running this it means appear _must_ be set

    if (!mounting && !enter || config.disabled) {
      this.safeSetState({
        status: ENTERED
      }, function () {
        _this2.props.onEntered(maybeNode);
      });
      return;
    }

    this.props.onEnter(maybeNode, maybeAppearing);
    this.safeSetState({
      status: ENTERING
    }, function () {
      _this2.props.onEntering(maybeNode, maybeAppearing);

      _this2.onTransitionEnd(enterTimeout, function () {
        _this2.safeSetState({
          status: ENTERED
        }, function () {
          _this2.props.onEntered(maybeNode, maybeAppearing);
        });
      });
    });
  };

  _proto.performExit = function performExit() {
    var _this3 = this;

    var exit = this.props.exit;
    var timeouts = this.getTimeouts();
    var maybeNode = this.props.nodeRef ? undefined : ReactDOM.findDOMNode(this); // no exit animation skip right to EXITED

    if (!exit || config.disabled) {
      this.safeSetState({
        status: EXITED
      }, function () {
        _this3.props.onExited(maybeNode);
      });
      return;
    }

    this.props.onExit(maybeNode);
    this.safeSetState({
      status: EXITING
    }, function () {
      _this3.props.onExiting(maybeNode);

      _this3.onTransitionEnd(timeouts.exit, function () {
        _this3.safeSetState({
          status: EXITED
        }, function () {
          _this3.props.onExited(maybeNode);
        });
      });
    });
  };

  _proto.cancelNextCallback = function cancelNextCallback() {
    if (this.nextCallback !== null) {
      this.nextCallback.cancel();
      this.nextCallback = null;
    }
  };

  _proto.safeSetState = function safeSetState(nextState, callback) {
    // This shouldn't be necessary, but there are weird race conditions with
    // setState callbacks and unmounting in testing, so always make sure that
    // we can cancel any pending setState callbacks after we unmount.
    callback = this.setNextCallback(callback);
    this.setState(nextState, callback);
  };

  _proto.setNextCallback = function setNextCallback(callback) {
    var _this4 = this;

    var active = true;

    this.nextCallback = function (event) {
      if (active) {
        active = false;
        _this4.nextCallback = null;
        callback(event);
      }
    };

    this.nextCallback.cancel = function () {
      active = false;
    };

    return this.nextCallback;
  };

  _proto.onTransitionEnd = function onTransitionEnd(timeout, handler) {
    this.setNextCallback(handler);
    var node = this.props.nodeRef ? this.props.nodeRef.current : ReactDOM.findDOMNode(this);
    var doesNotHaveTimeoutOrListener = timeout == null && !this.props.addEndListener;

    if (!node || doesNotHaveTimeoutOrListener) {
      setTimeout(this.nextCallback, 0);
      return;
    }

    if (this.props.addEndListener) {
      var _ref3 = this.props.nodeRef ? [this.nextCallback] : [node, this.nextCallback],
          maybeNode = _ref3[0],
          maybeNextCallback = _ref3[1];

      this.props.addEndListener(maybeNode, maybeNextCallback);
    }

    if (timeout != null) {
      setTimeout(this.nextCallback, timeout);
    }
  };

  _proto.render = function render() {
    var status = this.state.status;

    if (status === UNMOUNTED) {
      return null;
    }

    var _this$props = this.props,
        children = _this$props.children;
        _this$props.in;
        _this$props.mountOnEnter;
        _this$props.unmountOnExit;
        _this$props.appear;
        _this$props.enter;
        _this$props.exit;
        _this$props.timeout;
        _this$props.addEndListener;
        _this$props.onEnter;
        _this$props.onEntering;
        _this$props.onEntered;
        _this$props.onExit;
        _this$props.onExiting;
        _this$props.onExited;
        _this$props.nodeRef;
        var childProps = _objectWithoutPropertiesLoose(_this$props, ["children", "in", "mountOnEnter", "unmountOnExit", "appear", "enter", "exit", "timeout", "addEndListener", "onEnter", "onEntering", "onEntered", "onExit", "onExiting", "onExited", "nodeRef"]);

    return (
      /*#__PURE__*/
      // allows for nested Transitions
      React.createElement(TransitionGroupContext.Provider, {
        value: null
      }, typeof children === 'function' ? children(status, childProps) : React.cloneElement(React.Children.only(children), childProps))
    );
  };

  return Transition;
}(React.Component);

Transition.contextType = TransitionGroupContext;
Transition.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * A React reference to DOM element that need to transition:
   * https://stackoverflow.com/a/51127130/4671932
   *
   *   - When `nodeRef` prop is used, `node` is not passed to callback functions
   *      (e.g. `onEnter`) because user already has direct access to the node.
   *   - When changing `key` prop of `Transition` in a `TransitionGroup` a new
   *     `nodeRef` need to be provided to `Transition` with changed `key` prop
   *     (see
   *     [test/CSSTransition-test.js](https://github.com/reactjs/react-transition-group/blob/13435f897b3ab71f6e19d724f145596f5910581c/test/CSSTransition-test.js#L362-L437)).
   */
  nodeRef: PropTypes.shape({
    current: typeof Element === 'undefined' ? PropTypes.any : function (propValue, key, componentName, location, propFullName, secret) {
      var value = propValue[key];
      return PropTypes.instanceOf(value && 'ownerDocument' in value ? value.ownerDocument.defaultView.Element : Element)(propValue, key, componentName, location, propFullName, secret);
    }
  }),

  /**
   * A `function` child can be used instead of a React element. This function is
   * called with the current transition status (`'entering'`, `'entered'`,
   * `'exiting'`, `'exited'`), which can be used to apply context
   * specific props to a component.
   *
   * ```jsx
   * <Transition in={this.state.in} timeout={150}>
   *   {state => (
   *     <MyComponent className={`fade fade-${state}`} />
   *   )}
   * </Transition>
   * ```
   */
  children: PropTypes.oneOfType([PropTypes.func.isRequired, PropTypes.element.isRequired]).isRequired,

  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes.bool,

  /**
   * By default the child component is mounted immediately along with
   * the parent `Transition` component. If you want to "lazy mount" the component on the
   * first `in={true}` you can set `mountOnEnter`. After the first enter transition the component will stay
   * mounted, even on "exited", unless you also specify `unmountOnExit`.
   */
  mountOnEnter: PropTypes.bool,

  /**
   * By default the child component stays mounted after it reaches the `'exited'` state.
   * Set `unmountOnExit` if you'd prefer to unmount the component after it finishes exiting.
   */
  unmountOnExit: PropTypes.bool,

  /**
   * By default the child component does not perform the enter transition when
   * it first mounts, regardless of the value of `in`. If you want this
   * behavior, set both `appear` and `in` to `true`.
   *
   * > **Note**: there are no special appear states like `appearing`/`appeared`, this prop
   * > only adds an additional enter transition. However, in the
   * > `<CSSTransition>` component that first enter transition does result in
   * > additional `.appear-*` classes, that way you can choose to style it
   * > differently.
   */
  appear: PropTypes.bool,

  /**
   * Enable or disable enter transitions.
   */
  enter: PropTypes.bool,

  /**
   * Enable or disable exit transitions.
   */
  exit: PropTypes.bool,

  /**
   * The duration of the transition, in milliseconds.
   * Required unless `addEndListener` is provided.
   *
   * You may specify a single timeout for all transitions:
   *
   * ```jsx
   * timeout={500}
   * ```
   *
   * or individually:
   *
   * ```jsx
   * timeout={{
   *  appear: 500,
   *  enter: 300,
   *  exit: 500,
   * }}
   * ```
   *
   * - `appear` defaults to the value of `enter`
   * - `enter` defaults to `0`
   * - `exit` defaults to `0`
   *
   * @type {number | { enter?: number, exit?: number, appear?: number }}
   */
  timeout: function timeout(props) {
    var pt = timeoutsShape;
    if (!props.addEndListener) pt = pt.isRequired;

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return pt.apply(void 0, [props].concat(args));
  },

  /**
   * Add a custom transition end trigger. Called with the transitioning
   * DOM node and a `done` callback. Allows for more fine grained transition end
   * logic. Timeouts are still used as a fallback if provided.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * ```jsx
   * addEndListener={(node, done) => {
   *   // use the css transitionend event to mark the finish of a transition
   *   node.addEventListener('transitionend', done, false);
   * }}
   * ```
   */
  addEndListener: PropTypes.func,

  /**
   * Callback fired before the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEnter: PropTypes.func,

  /**
   * Callback fired after the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes.func,

  /**
   * Callback fired after the "entered" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEntered: PropTypes.func,

  /**
   * Callback fired before the "exiting" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExit: PropTypes.func,

  /**
   * Callback fired after the "exiting" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExiting: PropTypes.func,

  /**
   * Callback fired after the "exited" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExited: PropTypes.func
} : {}; // Name the function so it is clearer in the documentation

function noop() {}

Transition.defaultProps = {
  in: false,
  mountOnEnter: false,
  unmountOnExit: false,
  appear: false,
  enter: true,
  exit: true,
  onEnter: noop,
  onEntering: noop,
  onEntered: noop,
  onExit: noop,
  onExiting: noop,
  onExited: noop
};
Transition.UNMOUNTED = UNMOUNTED;
Transition.EXITED = EXITED;
Transition.ENTERING = ENTERING;
Transition.ENTERED = ENTERED;
Transition.EXITING = EXITING;
var Transition$1 = Transition;

var _addClass = function addClass$1(node, classes) {
  return node && classes && classes.split(' ').forEach(function (c) {
    return addClass(node, c);
  });
};

var removeClass = function removeClass(node, classes) {
  return node && classes && classes.split(' ').forEach(function (c) {
    return removeClass$1(node, c);
  });
};
/**
 * A transition component inspired by the excellent
 * [ng-animate](https://docs.angularjs.org/api/ngAnimate) library, you should
 * use it if you're using CSS transitions or animations. It's built upon the
 * [`Transition`](https://reactcommunity.org/react-transition-group/transition)
 * component, so it inherits all of its props.
 *
 * `CSSTransition` applies a pair of class names during the `appear`, `enter`,
 * and `exit` states of the transition. The first class is applied and then a
 * second `*-active` class in order to activate the CSS transition. After the
 * transition, matching `*-done` class names are applied to persist the
 * transition state.
 *
 * ```jsx
 * function App() {
 *   const [inProp, setInProp] = useState(false);
 *   return (
 *     <div>
 *       <CSSTransition in={inProp} timeout={200} classNames="my-node">
 *         <div>
 *           {"I'll receive my-node-* classes"}
 *         </div>
 *       </CSSTransition>
 *       <button type="button" onClick={() => setInProp(true)}>
 *         Click to Enter
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * When the `in` prop is set to `true`, the child component will first receive
 * the class `example-enter`, then the `example-enter-active` will be added in
 * the next tick. `CSSTransition` [forces a
 * reflow](https://github.com/reactjs/react-transition-group/blob/5007303e729a74be66a21c3e2205e4916821524b/src/CSSTransition.js#L208-L215)
 * between before adding the `example-enter-active`. This is an important trick
 * because it allows us to transition between `example-enter` and
 * `example-enter-active` even though they were added immediately one after
 * another. Most notably, this is what makes it possible for us to animate
 * _appearance_.
 *
 * ```css
 * .my-node-enter {
 *   opacity: 0;
 * }
 * .my-node-enter-active {
 *   opacity: 1;
 *   transition: opacity 200ms;
 * }
 * .my-node-exit {
 *   opacity: 1;
 * }
 * .my-node-exit-active {
 *   opacity: 0;
 *   transition: opacity 200ms;
 * }
 * ```
 *
 * `*-active` classes represent which styles you want to animate **to**, so it's
 * important to add `transition` declaration only to them, otherwise transitions
 * might not behave as intended! This might not be obvious when the transitions
 * are symmetrical, i.e. when `*-enter-active` is the same as `*-exit`, like in
 * the example above (minus `transition`), but it becomes apparent in more
 * complex transitions.
 *
 * **Note**: If you're using the
 * [`appear`](http://reactcommunity.org/react-transition-group/transition#Transition-prop-appear)
 * prop, make sure to define styles for `.appear-*` classes as well.
 */


var CSSTransition = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(CSSTransition, _React$Component);

  function CSSTransition() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    _this.appliedClasses = {
      appear: {},
      enter: {},
      exit: {}
    };

    _this.onEnter = function (maybeNode, maybeAppearing) {
      var _this$resolveArgument = _this.resolveArguments(maybeNode, maybeAppearing),
          node = _this$resolveArgument[0],
          appearing = _this$resolveArgument[1];

      _this.removeClasses(node, 'exit');

      _this.addClass(node, appearing ? 'appear' : 'enter', 'base');

      if (_this.props.onEnter) {
        _this.props.onEnter(maybeNode, maybeAppearing);
      }
    };

    _this.onEntering = function (maybeNode, maybeAppearing) {
      var _this$resolveArgument2 = _this.resolveArguments(maybeNode, maybeAppearing),
          node = _this$resolveArgument2[0],
          appearing = _this$resolveArgument2[1];

      var type = appearing ? 'appear' : 'enter';

      _this.addClass(node, type, 'active');

      if (_this.props.onEntering) {
        _this.props.onEntering(maybeNode, maybeAppearing);
      }
    };

    _this.onEntered = function (maybeNode, maybeAppearing) {
      var _this$resolveArgument3 = _this.resolveArguments(maybeNode, maybeAppearing),
          node = _this$resolveArgument3[0],
          appearing = _this$resolveArgument3[1];

      var type = appearing ? 'appear' : 'enter';

      _this.removeClasses(node, type);

      _this.addClass(node, type, 'done');

      if (_this.props.onEntered) {
        _this.props.onEntered(maybeNode, maybeAppearing);
      }
    };

    _this.onExit = function (maybeNode) {
      var _this$resolveArgument4 = _this.resolveArguments(maybeNode),
          node = _this$resolveArgument4[0];

      _this.removeClasses(node, 'appear');

      _this.removeClasses(node, 'enter');

      _this.addClass(node, 'exit', 'base');

      if (_this.props.onExit) {
        _this.props.onExit(maybeNode);
      }
    };

    _this.onExiting = function (maybeNode) {
      var _this$resolveArgument5 = _this.resolveArguments(maybeNode),
          node = _this$resolveArgument5[0];

      _this.addClass(node, 'exit', 'active');

      if (_this.props.onExiting) {
        _this.props.onExiting(maybeNode);
      }
    };

    _this.onExited = function (maybeNode) {
      var _this$resolveArgument6 = _this.resolveArguments(maybeNode),
          node = _this$resolveArgument6[0];

      _this.removeClasses(node, 'exit');

      _this.addClass(node, 'exit', 'done');

      if (_this.props.onExited) {
        _this.props.onExited(maybeNode);
      }
    };

    _this.resolveArguments = function (maybeNode, maybeAppearing) {
      return _this.props.nodeRef ? [_this.props.nodeRef.current, maybeNode] // here `maybeNode` is actually `appearing`
      : [maybeNode, maybeAppearing];
    };

    _this.getClassNames = function (type) {
      var classNames = _this.props.classNames;
      var isStringClassNames = typeof classNames === 'string';
      var prefix = isStringClassNames && classNames ? classNames + "-" : '';
      var baseClassName = isStringClassNames ? "" + prefix + type : classNames[type];
      var activeClassName = isStringClassNames ? baseClassName + "-active" : classNames[type + "Active"];
      var doneClassName = isStringClassNames ? baseClassName + "-done" : classNames[type + "Done"];
      return {
        baseClassName: baseClassName,
        activeClassName: activeClassName,
        doneClassName: doneClassName
      };
    };

    return _this;
  }

  var _proto = CSSTransition.prototype;

  _proto.addClass = function addClass(node, type, phase) {
    var className = this.getClassNames(type)[phase + "ClassName"];

    var _this$getClassNames = this.getClassNames('enter'),
        doneClassName = _this$getClassNames.doneClassName;

    if (type === 'appear' && phase === 'done' && doneClassName) {
      className += " " + doneClassName;
    } // This is to force a repaint,
    // which is necessary in order to transition styles when adding a class name.


    if (phase === 'active') {
      if (node) forceReflow(node);
    }

    if (className) {
      this.appliedClasses[type][phase] = className;

      _addClass(node, className);
    }
  };

  _proto.removeClasses = function removeClasses(node, type) {
    var _this$appliedClasses$ = this.appliedClasses[type],
        baseClassName = _this$appliedClasses$.base,
        activeClassName = _this$appliedClasses$.active,
        doneClassName = _this$appliedClasses$.done;
    this.appliedClasses[type] = {};

    if (baseClassName) {
      removeClass(node, baseClassName);
    }

    if (activeClassName) {
      removeClass(node, activeClassName);
    }

    if (doneClassName) {
      removeClass(node, doneClassName);
    }
  };

  _proto.render = function render() {
    var _this$props = this.props;
        _this$props.classNames;
        var props = _objectWithoutPropertiesLoose(_this$props, ["classNames"]);

    return /*#__PURE__*/React.createElement(Transition$1, _extends({}, props, {
      onEnter: this.onEnter,
      onEntered: this.onEntered,
      onEntering: this.onEntering,
      onExit: this.onExit,
      onExiting: this.onExiting,
      onExited: this.onExited
    }));
  };

  return CSSTransition;
}(React.Component);

CSSTransition.defaultProps = {
  classNames: ''
};
CSSTransition.propTypes = process.env.NODE_ENV !== "production" ? _extends({}, Transition$1.propTypes, {
  /**
   * The animation classNames applied to the component as it appears, enters,
   * exits or has finished the transition. A single name can be provided, which
   * will be suffixed for each stage, e.g. `classNames="fade"` applies:
   *
   * - `fade-appear`, `fade-appear-active`, `fade-appear-done`
   * - `fade-enter`, `fade-enter-active`, `fade-enter-done`
   * - `fade-exit`, `fade-exit-active`, `fade-exit-done`
   *
   * A few details to note about how these classes are applied:
   *
   * 1. They are _joined_ with the ones that are already defined on the child
   *    component, so if you want to add some base styles, you can use
   *    `className` without worrying that it will be overridden.
   *
   * 2. If the transition component mounts with `in={false}`, no classes are
   *    applied yet. You might be expecting `*-exit-done`, but if you think
   *    about it, a component cannot finish exiting if it hasn't entered yet.
   *
   * 2. `fade-appear-done` and `fade-enter-done` will _both_ be applied. This
   *    allows you to define different behavior for when appearing is done and
   *    when regular entering is done, using selectors like
   *    `.fade-enter-done:not(.fade-appear-done)`. For example, you could apply
   *    an epic entrance animation when element first appears in the DOM using
   *    [Animate.css](https://daneden.github.io/animate.css/). Otherwise you can
   *    simply use `fade-enter-done` for defining both cases.
   *
   * Each individual classNames can also be specified independently like:
   *
   * ```js
   * classNames={{
   *  appear: 'my-appear',
   *  appearActive: 'my-active-appear',
   *  appearDone: 'my-done-appear',
   *  enter: 'my-enter',
   *  enterActive: 'my-active-enter',
   *  enterDone: 'my-done-enter',
   *  exit: 'my-exit',
   *  exitActive: 'my-active-exit',
   *  exitDone: 'my-done-exit',
   * }}
   * ```
   *
   * If you want to set these classes using CSS Modules:
   *
   * ```js
   * import styles from './styles.css';
   * ```
   *
   * you might want to use camelCase in your CSS file, that way could simply
   * spread them instead of listing them one by one:
   *
   * ```js
   * classNames={{ ...styles }}
   * ```
   *
   * @type {string | {
   *  appear?: string,
   *  appearActive?: string,
   *  appearDone?: string,
   *  enter?: string,
   *  enterActive?: string,
   *  enterDone?: string,
   *  exit?: string,
   *  exitActive?: string,
   *  exitDone?: string,
   * }}
   */
  classNames: classNamesShape,

  /**
   * A `<Transition>` callback fired immediately after the 'enter' or 'appear' class is
   * applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEnter: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'enter-active' or
   * 'appear-active' class is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'enter' or
   * 'appear' classes are **removed** and the `done` class is added to the DOM node.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntered: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit' class is
   * applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExit: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit-active' is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExiting: PropTypes.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit' classes
   * are **removed** and the `exit-done` class is added to the DOM node.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement)
   */
  onExited: PropTypes.func
}) : {};
var CSSTransition$1 = CSSTransition;

const defaultStyle$3 = timeout => ({
  transition: `opacity ${timeout}ms ease-in-out`,
  opacity: 0
});
const transitionStyles$3 = {
  entering: {
    opacity: 0
  },
  entered: {
    opacity: 1
  }
};
const Fade = ({
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(Transition$1, rest, status => /*#__PURE__*/React.createElement("div", {
  style: {
    ...defaultStyle$3(rest.timeout),
    ...transitionStyles$3[status]
  }
}, children()));
Fade.propTypes = {
  timeout: PropTypes.number.isRequired,
  children: PropTypes.func.isRequired
};

const defaultStyle$2 = (timeout, delay) => {
  return {
    transition: `height ${timeout}ms ${delay ? `${delay}ms` : ""}`,
    overflow: "hidden"
  };
};
const transitionStyles$2 = height => ({
  entering: {
    height: `${height}px`
  },
  entered: {
    height: `${height}px`,
    overflow: "visible"
  },
  exiting: {
    height: 0
  },
  exited: {
    height: 0,
    visibility: "hidden"
  }
});
const Reveal = ({
  duration,
  timeout,
  height,
  delay,
  children,
  ...rest
}) => {
  const transitionTimeout = duration || timeout;
  return /*#__PURE__*/React.createElement(Transition$1, _extends$1({}, rest, {
    timeout: transitionTimeout + delay
  }), status => /*#__PURE__*/React.createElement("div", {
    style: {
      ...defaultStyle$2(transitionTimeout, delay),
      ...transitionStyles$2(height)[status]
    },
    "aria-hidden": status === "exited",
    "data-testid": "childrenContainer"
  }, children()));
};
Reveal.propTypes = {
  timeout: PropTypes.number.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  children: PropTypes.func.isRequired
};
Reveal.defaultProps = {
  duration: undefined,
  delay: undefined
};

const StyledContainer$1 = styled.div({
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none !important"
  }
});
const defaultStyle$1 = timeout => ({
  transition: `transform ${timeout}ms`
});
const transitionStyles$1 = (direction, distance) => {
  const styles = {
    transform: `translate${direction.toUpperCase()}(${distance})`
  };
  return {
    entering: styles,
    entered: styles
  };
};
const Translate = ({
  initialStyle,
  direction,
  distance,
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(Transition$1, rest, status => /*#__PURE__*/React.createElement(StyledContainer$1, {
  style: {
    ...initialStyle,
    ...defaultStyle$1(rest.timeout),
    ...transitionStyles$1(direction, distance)[status]
  }
}, children()));
Translate.propTypes = {
  timeout: PropTypes.number.isRequired,
  direction: PropTypes.oneOf(["x", "y"]).isRequired,
  distance: PropTypes.string.isRequired,
  initialStyle: PropTypes.object,
  children: PropTypes.func.isRequired
};
Translate.defaultProps = {
  initialStyle: undefined
};

const StyledContainer = styled.div({
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none !important"
  }
});
const defaultStyle = () => ({
  opacity: 0,
  height: 0,
  overflow: "hidden"
});
const transitionStyles = (height, timeout) => ({
  entering: {
    opacity: 1,
    height,
    transition: `height ${timeout}ms ease-in-out, opacity ${timeout}ms ease-in-out`
  },
  entered: {
    opacity: 1,
    height: "auto",
    visibility: "visible",
    transition: "unset"
  },
  exiting: {
    opacity: 1,
    height,
    visibility: "visible",
    transition: `height ${timeout}ms ease-in-out, opacity ${timeout}ms ease-in-out, visibility 0ms ${timeout}ms`
  },
  exited: {
    opacity: 0,
    height: "0px",
    visibility: "hidden",
    transition: `height ${timeout}ms ease-in-out, opacity ${timeout}ms ease-in-out, visibility 0ms ${timeout}ms`
  }
});
const FadeAndReveal = ({
  timeout,
  height,
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(CSSTransition$1, _extends$1({}, rest, {
  timeout: {
    appear: timeout,
    enter: timeout,
    exit: 0
  }
}), state => /*#__PURE__*/React.createElement(StyledContainer, {
  style: {
    ...defaultStyle(),
    ...transitionStyles(height, timeout)[state]
  },
  "aria-hidden": state === "exiting" || state === "exited"
}, children()));
FadeAndReveal.propTypes = {
  height: PropTypes.number.isRequired,
  timeout: PropTypes.number,
  children: PropTypes.func.isRequired
};
FadeAndReveal.defaultProps = {
  timeout: 0
};

const parseHeader = text => {
  const t = text.replace("&trade;", "\u2122").replace("&reg;", "\u00AE").split("^^").map((line, index) => {
    if (line === "") {
      return "";
    }
    if (index % 2 === 0) {
      return line;
    }
    return /*#__PURE__*/React.createElement("sup", {
      key: line
    }, line);
  });
  return t;
};
const HeaderButtonClickable = styled.button(noStyle, ({
  panelDisabled
}) => ({
  width: "100%",
  textAlign: "left",
  ...(panelDisabled && {
    background: colorGreyAthens,
    cursor: "default"
  })
}));
const CaretContainer = styled.div(({
  isDisabled
}) => ({
  ...(isDisabled && {
    visibility: "hidden"
  })
}));
const HeaderContainer = styled.div(({
  direction
}) => ({
  display: "flex",
  flexDirection: direction,
  flex: "1 1 auto",
  width: "100%",
  alignItems: "flex-start"
}));
const HeaderTitleContainer = styled.div({
  width: "100%"
});
const HeaderSubtextContainer = styled.div({
  lineHeight: "1px"
});
const TertiaryTextAlignmentContainer = styled.div({
  ...media.until("md").css({
    alignSelf: "flex-end"
  })
});
const ShowFromMd = styled.div({
  display: "none",
  ...media.from("md").css({
    display: "inline-block",
    whiteSpace: "nowrap"
  })
});
const ShowUntilMd = styled.div({
  display: "inline-block",
  whiteSpace: "nowrap",
  ...media.from("md").css({
    display: "none"
  })
});
const StyledPanellessWrapper = styled(Box)({
  marginLeft: "1.5rem"
});
const ContentContainer = styled.div(({
  compact
}) => ({
  padding: compact ? "0.5rem 0" : "2rem"
}));
ContentContainer.displayName = "ContentContainer";
class PanelWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.contentWrapper = null;
  }
  state = {
    open: this.props.open,
    hover: false,
    contentWrapperHeight: 0
  };
  static getDerivedStateFromProps(props, state) {
    if (state.open !== props.open) {
      if (props.panelOnToggle) {
        props.panelOnToggle(props.open);
      }
      return {
        open: props.open
      };
    }
    return null;
  }
  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open) {
      this.setContentWrapperHeight();
    }
  }
  setContentWrapperHeight = () => {
    this.setState({
      contentWrapperHeight: this.contentWrapper.offsetHeight
    });
  };
  handleClick = e => {
    this.setContentWrapperHeight();
    this.props.onClick(e);
  };
  mouseEnter = () => {
    this.setState({
      hover: true
    });
  };
  mouseLeave = () => {
    this.setState({
      hover: false
    });
  };
  renderCaret = (disabled, hover, open) => {
    return /*#__PURE__*/React.createElement(CaretContainer, {
      isDisabled: disabled
    }, /*#__PURE__*/React.createElement(Translate, {
      timeout: 300,
      in: hover,
      direction: "y",
      distance: open ? "-0.25rem" : "0.25rem"
    }, () => /*#__PURE__*/React.createElement(Text, {
      size: "large"
    }, open ? /*#__PURE__*/React.createElement(CaretUp, null) : /*#__PURE__*/React.createElement(CaretDown, null))));
  };
  renderHeader = (header, subtext, tertiaryText) => {
    return /*#__PURE__*/React.createElement(HeaderContainer, {
      direction: "row"
    }, /*#__PURE__*/React.createElement(HeaderContainer, {
      direction: "column"
    }, /*#__PURE__*/React.createElement(HeaderTitleContainer, null, /*#__PURE__*/React.createElement(Text, {
      size: "large"
    }, parseHeader(header))), subtext && /*#__PURE__*/React.createElement(HeaderSubtextContainer, null, /*#__PURE__*/React.createElement(Text, {
      size: "small"
    }, subtext))), tertiaryText && /*#__PURE__*/React.createElement(TertiaryTextAlignmentContainer, null, /*#__PURE__*/React.createElement(ShowFromMd, null, /*#__PURE__*/React.createElement(Text, {
      "data-testid": "tertiarytext",
      size: "large"
    }, tertiaryText)), /*#__PURE__*/React.createElement(ShowUntilMd, null, /*#__PURE__*/React.createElement(Text, {
      "data-testid": "tertiarytext",
      size: "medium"
    }, tertiaryText))));
  };
  renderPanelWrapper = () => {
    const {
      panelHeader,
      panelSubtext,
      panelTertiaryText,
      panelDisabled,
      tag,
      children,
      compact
    } = this.props;
    if (!children.props.children) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(StyledPanellessWrapper, {
        vertical: 3,
        style: {
          marginLeft: "1.5rem"
        }
      }, /*#__PURE__*/React.createElement(Box, {
        inline: true,
        between: 3
      }, this.renderHeader(panelHeader, panelSubtext, panelTertiaryText))), /*#__PURE__*/React.createElement(HairlineDivider, null));
    }
    const headerButton = /*#__PURE__*/React.createElement(HeaderButtonClickable, {
      type: "button",
      panelDisabled: panelDisabled,
      onClick: this.handleClick,
      onMouseEnter: this.mouseEnter,
      onMouseLeave: this.mouseLeave,
      disabled: panelDisabled,
      "aria-expanded": this.state.open
    }, /*#__PURE__*/React.createElement(Box, {
      vertical: compact ? 0 : 3
    }, /*#__PURE__*/React.createElement(Box, {
      inline: true,
      between: 3
    }, this.renderCaret(panelDisabled, this.state.hover, this.state.open), this.renderHeader(panelHeader, panelSubtext, panelTertiaryText))));
    return /*#__PURE__*/React.createElement("div", null, tag ? /*#__PURE__*/React.createElement(tag, {
      "data-testid": "headerWrapper"
    }, headerButton) : headerButton, /*#__PURE__*/React.createElement(FadeAndReveal, {
      timeout: 500,
      in: this.state.open,
      height: this.state.contentWrapperHeight
    }, () => /*#__PURE__*/React.createElement("div", {
      ref: contentWrapper => {
        this.contentWrapper = contentWrapper;
      },
      "data-testid": "content"
    }, /*#__PURE__*/React.createElement(DimpleDivider, null), /*#__PURE__*/React.createElement(ContentContainer, {
      compact: compact
    }, /*#__PURE__*/React.createElement(Text, {
      block: true
    }, children)))), /*#__PURE__*/React.createElement(HairlineDivider, null));
  };
  render() {
    const {
      panelId
    } = this.props;
    return /*#__PURE__*/React.createElement("div", {
      id: panelId,
      "data-testid": panelId
    }, this.renderPanelWrapper());
  }
}
PanelWrapper.propTypes = {
  panelId: PropTypes.string.isRequired,
  panelHeader: PropTypes.string.isRequired,
  panelSubtext: PropTypes.string,
  panelTertiaryText: PropTypes.string,
  panelOnToggle: PropTypes.func,
  // eslint-disable-line react/no-unused-prop-types
  panelDisabled: PropTypes.bool,
  open: PropTypes.bool,
  tag: PropTypes.oneOf(["h1", "h2", "h3", "h4"]),
  onClick: PropTypes.func.isRequired,
  children: componentWithName("Panel").isRequired,
  compact: PropTypes.bool
};
PanelWrapper.defaultProps = {
  panelSubtext: undefined,
  panelTertiaryText: undefined,
  panelDisabled: false,
  panelOnToggle: undefined,
  open: false,
  tag: undefined,
  compact: false
};

const PanelBase = styled.div({
  backgroundColor: colorWhite
});
const Panels = ({
  topDivider,
  isPanelOpen,
  togglePanel,
  tag,
  children,
  compact,
  ...rest
}) => /*#__PURE__*/React.createElement(PanelBase, safeRest(rest), topDivider && /*#__PURE__*/React.createElement(HairlineDivider, null), React.Children.toArray(children).filter(Boolean).map(panel => {
  const {
    id,
    header,
    subtext,
    tertiaryText,
    disabled,
    onToggle
  } = panel.props;
  return /*#__PURE__*/React.createElement(PanelWrapper, {
    key: id,
    panelId: id,
    panelHeader: header,
    panelSubtext: subtext,
    panelTertiaryText: tertiaryText,
    panelOnToggle: onToggle,
    panelDisabled: disabled,
    tag: tag,
    open: isPanelOpen(id),
    onClick: () => togglePanel(id),
    compact: compact
  }, panel);
}));
Panels.propTypes = {
  topDivider: PropTypes.bool.isRequired,
  isPanelOpen: PropTypes.func.isRequired,
  togglePanel: PropTypes.func.isRequired,
  children: componentWithName("Panel").isRequired,
  tag: PropTypes.oneOf(["h1", "h2", "h3", "h4"]),
  compact: PropTypes.bool
};
Panels.defaultProps = {
  tag: undefined,
  compact: false
};

/* eslint-disable react/no-unused-prop-types */


/**
 * Expandable content areas for use with the `ExpandCollapse` or `Accordion`
 *
 * _This component can only be accessed as a name-spaced component: `ExpandCollapse.Panel` or `Accordion.Panel`._
 */
const Panel = ({
  children
}) => /*#__PURE__*/React.createElement("div", null, children);
Panel.propTypes = {
  /**
   * The identifier of the panel. Must be unique within the `ExpandCollapse` panels.
   */
  id: PropTypes.string.isRequired,
  /**
   * The title.
   */
  header: PropTypes.string.isRequired,
  /**
   * Optional subtext.
   */
  subtext: PropTypes.string,
  /**
   * Optional tertiary text. Will be displayed on the right side of the panel header.
   */
  tertiaryText: PropTypes.string,
  /**
   * Whether or not to disable the panel from being opened or closed.
   */
  disabled: PropTypes.bool,
  /**
   * A callback function to be invoked when the panel is opened or closed.
   *
   * @param {boolean} open Whether or not the panel is open or closed.
   */
  onToggle: PropTypes.func,
  /**
   * The content. Can be text, any HTML element, or any component.
   */
  children: PropTypes.node
};
Panel.defaultProps = {
  subtext: undefined,
  tertiaryText: undefined,
  disabled: false,
  onToggle: undefined,
  children: undefined
};

class Accordion extends React.Component {
  state = {
    openPanel: this.props.open,
    prevOpenPanel: null
  };
  static getDerivedStateFromProps(props, state) {
    const {
      prevOpenPanel
    } = state;
    const open = props.open;
    if (open !== prevOpenPanel) {
      return {
        openPanel: open,
        prevOpenPanel: open
      };
    }
    return null;
  }
  togglePanel = panelId => {
    const {
      onToggle
    } = this.props;
    this.setState(({
      openPanel
    }) => {
      return {
        openPanel: openPanel === panelId ? undefined : panelId
      };
    }, () => {
      if (onToggle) {
        onToggle(this.state.openPanel);
      }
    });
  };
  isPanelOpen = panelId => {
    return this.state.openPanel === panelId;
  };
  render() {
    const {
      children,
      ...rest
    } = this.props;
    return /*#__PURE__*/React.createElement(Panels, _extends$1({}, rest, {
      isPanelOpen: this.isPanelOpen,
      togglePanel: this.togglePanel
    }), children);
  }
}
Accordion.propTypes = {
  open: PropTypes.string,
  topDivider: PropTypes.bool,
  onToggle: PropTypes.func,
  children: componentWithName("Panel")
};
Accordion.defaultProps = {
  open: undefined,
  topDivider: true,
  onToggle: undefined,
  children: undefined
};
Accordion.Panel = Panel;

const difference = (start, compare) => {
  const setDifference = new Set(start);
  compare.forEach(element => setDifference.delete(element));
  return setDifference;
};
const isEqual = (setA, setB) => {
  const differenceAtoB = difference(setA, setB);
  const differenceBtoA = difference(setB, setA);
  return differenceAtoB.size === 0 && differenceBtoA.size === 0;
};

class ExpandCollapse extends React.Component {
  state = {
    openPanels: new Set(this.props.open),
    prevOpenPanels: new Set()
  };
  static getDerivedStateFromProps(props, state) {
    const {
      prevOpenPanels
    } = state;
    const open = new Set(props.open);
    if (!isEqual(open, prevOpenPanels)) {
      return {
        openPanels: open,
        prevOpenPanels: open
      };
    }
    return null;
  }
  togglePanel = panelId => {
    const {
      onToggle
    } = this.props;
    this.setState(({
      openPanels
    }) => {
      const nextPanels = new Set(openPanels);
      if (nextPanels.has(panelId)) {
        nextPanels.delete(panelId);
      } else {
        nextPanels.add(panelId);
      }
      return {
        openPanels: nextPanels
      };
    }, () => {
      if (onToggle) {
        onToggle(Array.from(this.state.openPanels));
      }
    });
  };
  isPanelOpen = panelId => {
    return this.state.openPanels.has(panelId);
  };
  render() {
    const {
      tag,
      children,
      compact,
      ...rest
    } = this.props;
    return /*#__PURE__*/React.createElement(Panels, _extends$1({}, rest, {
      isPanelOpen: this.isPanelOpen,
      togglePanel: this.togglePanel,
      tag: tag,
      compact: compact
    }), children);
  }
}
ExpandCollapse.propTypes = {
  open: PropTypes.arrayOf(PropTypes.string),
  topDivider: PropTypes.bool,
  onToggle: PropTypes.func,
  tag: PropTypes.oneOf(["h1", "h2", "h3", "h4"]),
  children: componentWithName("Panel"),
  compact: PropTypes.bool
};
ExpandCollapse.defaultProps = {
  open: [],
  topDivider: true,
  onToggle: undefined,
  tag: undefined,
  children: undefined,
  compact: false
};
ExpandCollapse.Panel = Panel;

const GutterContext = /*#__PURE__*/React.createContext(false);

const calculateLevel = (xs, sm, md, lg, xl) => {
  const levelToggles = [xs, sm, md, lg, xl];
  const enabledLevels = [false, false, false, false, false];
  for (let toggles = 0; toggles < levelToggles.length; toggles += 1) {
    for (let levels = toggles; levels < enabledLevels.length; levels += 1) {
      if (levelToggles[toggles] !== undefined) {
        enabledLevels[levels] = levelToggles[toggles];
      }
    }
  }
  return enabledLevels;
};

const toPercent = num => {
  return `${num / 12 * 100}%`;
};
const calculateWidth = (breakpoint, value) => {
  if (typeof value === "undefined") {
    return {};
  }
  if (typeof value === "number") {
    const percent = toPercent(value);
    return media.from(breakpoint).css({
      maxWidth: percent,
      flexBasis: percent
    });
  }
  return {
    flexGrow: 1,
    flexBasis: 0,
    maxWidth: "100%"
  };
};
const calculateOffset = (breakpoint, value) => {
  if (typeof value === "number") {
    const percent = toPercent(value);
    return media.from(breakpoint).css({
      marginLeft: percent
    });
  }
  return {};
};
const sizeStyles = ({
  xs,
  sm,
  md,
  lg,
  xl
}) => ({
  flex: "0 0 auto",
  flexBasis: "100%",
  maxWidth: "100%",
  ...calculateWidth("xs", xs),
  ...calculateWidth("sm", sm),
  ...calculateWidth("md", md),
  ...calculateWidth("lg", lg),
  ...calculateWidth("xl", xl)
});
const offsetStyles = ({
  xsOffset,
  smOffset,
  mdOffset,
  lgOffset,
  xlOffset
}) => ({
  ...calculateOffset("xs", xsOffset),
  ...calculateOffset("sm", smOffset),
  ...calculateOffset("md", mdOffset),
  ...calculateOffset("lg", lgOffset),
  ...calculateOffset("xl", xlOffset)
});
const StyledCol = styled.div(sizeStyles, offsetStyles, ({
  hiddenLevel,
  gutter,
  horizontalAlignLevel
}) => ({
  paddingLeft: gutter ? "1rem" : 0,
  paddingRight: gutter ? "1rem" : 0,
  ...media.until("sm").css({
    display: hiddenLevel[0] === 0 ? "none" : "block",
    textAlign: horizontalAlignLevel[0]
  }),
  ...media.from("sm").css({
    display: hiddenLevel[1] === 0 ? "none" : "block",
    textAlign: horizontalAlignLevel[1]
  }),
  ...media.from("md").css({
    display: hiddenLevel[2] === 0 ? "none" : "block",
    textAlign: horizontalAlignLevel[2]
  }),
  ...media.from("lg").css({
    display: hiddenLevel[3] === 0 ? "none" : "block",
    textAlign: horizontalAlignLevel[3]
  }),
  ...media.from("xl").css({
    display: hiddenLevel[4] === 0 ? "none" : "block",
    textAlign: horizontalAlignLevel[4]
  })
}));
const Col = ({
  span,
  offset,
  horizontalAlign,
  children,
  ...rest
}) => {
  if (offset) {
    deprecate("core-flex-grid", "The `offset` prop is deprecated due to the addition of the responsive offset props. Use `xsOffset` instead.");
  }
  if (span) {
    deprecate("core-flex-grid", "The `span` prop is deprecated due to the addition of the responsive props. Use `xs` instead.");
  }
  const props = {
    ...rest
  };
  if (offset && !props.xsOffset) {
    props.xsOffset = offset;
  }
  const hiddenLevel = calculateLevel(rest.xs, rest.sm, rest.md, rest.lg, rest.xl);
  const horizontalAlignLevel = () => {
    if (typeof horizontalAlign === "object") {
      return calculateLevel(horizontalAlign.xs, horizontalAlign.sm, horizontalAlign.md, horizontalAlign.lg, horizontalAlign.xl);
    }
    if (typeof horizontalAlign === "string") {
      return [horizontalAlign, horizontalAlign, horizontalAlign, horizontalAlign, horizontalAlign];
    }
    return ["inherit", "inherit", "inherit", "inherit", "inherit"];
  };
  return /*#__PURE__*/React.createElement(GutterContext.Consumer, null, gutter => /*#__PURE__*/React.createElement(StyledCol, _extends$1({}, safeRest(props), {
    xs: rest.xs || span || true,
    hiddenLevel: hiddenLevel,
    gutter: gutter,
    horizontalAlignLevel: horizontalAlignLevel()
  }), children));
};
Col.propTypes = {
  xs: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, true, false]),
  sm: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, true, false]),
  md: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, true, false]),
  lg: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, true, false]),
  xl: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, true, false]),
  xsOffset: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  smOffset: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  mdOffset: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  lgOffset: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  xlOffset: PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  children: PropTypes.node.isRequired,
  span: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  offset: PropTypes.oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]),
  horizontalAlign: responsiveProps(PropTypes.string)
};
Col.defaultProps = {
  span: undefined,
  offset: undefined,
  horizontalAlign: undefined
};

const horizontalAlignStyles = ({
  horizontalAlign
}) => {
  switch (horizontalAlign) {
    case "start":
      return {
        justifyContent: "flex-start",
        textAlign: "left"
      };
    case "center":
      return {
        justifyContent: "center",
        textAlign: "center"
      };
    case "end":
      return {
        justifyContent: "flex-end",
        textAlign: "right"
      };
    default:
      return {};
  }
};
const verticalAlignStyles = ({
  verticalAlign
}) => {
  switch (verticalAlign) {
    case "top":
      return {
        alignItems: "flex-start"
      };
    case "middle":
      return {
        alignItems: "center"
      };
    case "bottom":
      return {
        alignItems: "flex-end"
      };
    default:
      return {};
  }
};
const distributeStyles = ({
  distribute
}) => {
  let justifyContent;
  if (distribute === "between") {
    justifyContent = "space-between";
  }
  if (distribute === "around") {
    justifyContent = "space-around";
  }
  return {
    justifyContent
  };
};
const StyledRow = styled.div(horizontalAlignStyles, verticalAlignStyles, distributeStyles, ({
  reverseLevel
}) => ({
  width: "100%",
  margin: "0 auto",
  display: "flex",
  flex: "0 1 auto",
  flexDirection: "row",
  flexWrap: "wrap",
  flexShrink: 0,
  ...media.until("sm").css({
    flexDirection: reverseLevel[0] ? "row-reverse" : "row"
  }),
  ...media.from("sm").css({
    flexDirection: reverseLevel[1] ? "row-reverse" : "row"
  }),
  ...media.from("md").css({
    flexDirection: reverseLevel[2] ? "row-reverse" : "row"
  }),
  ...media.from("lg").css({
    flexDirection: reverseLevel[3] ? "row-reverse" : "row"
  }),
  ...media.from("xl").css({
    flexDirection: reverseLevel[4] ? "row-reverse" : "row"
  })
}));
const Row = ({
  horizontalAlign,
  verticalAlign,
  distribute,
  xsReverse,
  smReverse,
  mdReverse,
  lgReverse,
  xlReverse,
  children,
  ...rest
}) => {
  const reverseLevel = calculateLevel(xsReverse, smReverse, mdReverse, lgReverse, xlReverse);
  return /*#__PURE__*/React.createElement(StyledRow, _extends$1({}, safeRest(rest), {
    horizontalAlign: horizontalAlign,
    verticalAlign: verticalAlign,
    distribute: distribute,
    reverseLevel: reverseLevel
  }), children);
};
Row.propTypes = {
  /**
   * Align columns horizontally within their row.
   */
  horizontalAlign: PropTypes.oneOf(["start", "center", "end"]),
  /**
   * Align columns vertically within their row.
   */
  verticalAlign: PropTypes.oneOf(["top", "middle", "bottom"]),
  /**
   * Distribute empty space around columns.
   */
  distribute: PropTypes.oneOf(["around", "between"]),
  /**
   * Choose if the item order should be reversed from the 'xs' breakpoint. When you pass in false, the order will be normal from the xs breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  xsReverse: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'sm' breakpoint. When you pass in false, the order will be normal from the sm breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  smReverse: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'md' breakpoint. When you pass in false, the order will be normal from the md breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  mdReverse: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'lg' breakpoint. When you pass in false, the order will be normal from the lg breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  lgReverse: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'xl' breakpoint. When you pass in false, the order will be normal from the xl breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  xlReverse: PropTypes.bool,
  children: PropTypes.node.isRequired
};
Row.defaultProps = {
  horizontalAlign: undefined,
  verticalAlign: undefined,
  distribute: undefined,
  xsReverse: undefined,
  smReverse: undefined,
  mdReverse: undefined,
  lgReverse: undefined,
  xlReverse: undefined
};

const rem = breakpoint => pixelToRem(breakpoints[breakpoint]);
const StyledGrid = styled.div(({
  reverseLevel,
  limitWidth,
  outsideGutter
}) => ({
  display: "flex",
  flexWrap: "wrap",
  margin: `0 ${!outsideGutter ? "-1rem" : "auto"}`,
  width: !outsideGutter ? undefined : "100%",
  ...media.until("sm").css({
    flexDirection: reverseLevel[0] ? "column-reverse" : "column"
  }),
  ...media.from("sm").css({
    ...(limitWidth && {
      maxWidth: rem("sm")
    }),
    flexDirection: reverseLevel[1] ? "column-reverse" : "column"
  }),
  ...media.from("md").css({
    ...(limitWidth && {
      maxWidth: rem("md")
    }),
    flexDirection: reverseLevel[2] ? "column-reverse" : "column"
  }),
  ...media.from("lg").css({
    ...(limitWidth && {
      maxWidth: rem("lg")
    }),
    flexDirection: reverseLevel[3] ? "column-reverse" : "column"
  }),
  ...media.from("xl").css({
    ...(limitWidth && {
      maxWidth: rem("xl")
    }),
    flexDirection: reverseLevel[4] ? "column-reverse" : "column"
  })
}));
const FlexGrid = ({
  limitWidth,
  gutter,
  outsideGutter,
  xsReverse,
  smReverse,
  mdReverse,
  lgReverse,
  xlReverse,
  children,
  ...rest
}) => {
  const reverseLevel = calculateLevel(xsReverse, smReverse, mdReverse, lgReverse, xlReverse);
  return /*#__PURE__*/React.createElement(GutterContext.Provider, {
    value: gutter
  }, /*#__PURE__*/React.createElement(StyledGrid, _extends$1({}, safeRest(rest), {
    outsideGutter: outsideGutter,
    reverseLevel: reverseLevel,
    limitWidth: limitWidth
  }), children));
};
FlexGrid.propTypes = {
  /**
   * Whether or not to give the grid a fixed width. This also centres the grid horizontally.
   */
  limitWidth: PropTypes.bool,
  /**
   * Whether or not to include gutters in between columns.
   */
  gutter: PropTypes.bool,
  /**
   * Whether or not to include gutter at the ends to the left and right of the FlexGrid
   */
  outsideGutter: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'xs' breakpoint. When you pass in false, the order will be normal from the xs breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  xsReverse: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'sm' breakpoint. When you pass in false, the order will be normal from the sm breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  smReverse: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'md' breakpoint. When you pass in false, the order will be normal from the md breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  mdReverse: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'lg' breakpoint. When you pass in false, the order will be normal from the lg breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  lgReverse: PropTypes.bool,
  /**
   * Choose if the item order should be reversed from the 'xl' breakpoint. When you pass in false, the order will be normal from the xl breakpoint. By default, it inherits the behaviour set by the preceding prop.
   */
  xlReverse: PropTypes.bool,
  /**
   * The rows and columns of the Grid. Will typically be `FlexGrid.Row` and `FlexGrid.Col` components.
   */
  children: PropTypes.node.isRequired
};
FlexGrid.defaultProps = {
  limitWidth: true,
  gutter: true,
  outsideGutter: true,
  xsReverse: undefined,
  smReverse: undefined,
  mdReverse: undefined,
  lgReverse: undefined,
  xlReverse: undefined
};
FlexGrid.Row = Row;
FlexGrid.Col = Col;

const StyledLabelContainer$2 = styled(Box)({
  alignItems: "center"
});
const StyledInput = styled.input({
  boxSizing: "border-box",
  width: "100%",
  margin: 0,
  outline: 0,
  textOverflow: "ellipsis",
  borderColor: colorGreyShuttle,
  "&::placeholder": {
    font: "inherit",
    letterSpacing: "inherit",
    lineHeight: "inherit",
    color: colorGreyShuttle
  }
}, thin, rounded, font, medium, mediumFont, color, ({
  withFeedbackIcon
}) => ({
  "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
    appearance: "none",
    margin: 0
  },
  "-moz-appearance": "textfield",
  minHeight: inputHeight.height,
  maxHeight: inputHeight.height,
  padding: withFeedbackIcon ? "0.5rem 3rem 0.5rem 1rem" : "0.5rem 1rem"
}), {
  "&:focus": {
    borderColor: "transparent",
    boxShadow: `0 0 4px 1px ${colorGreyShuttle}`,
    backgroundColor: colorWhite
  }
}, ({
  feedback
}) => {
  let borderColor;
  if (feedback === "success") {
    borderColor = colorPrimary;
  } else if (feedback === "error") {
    borderColor = colorCardinal;
  }
  return {
    "&:not(:focus)": {
      borderColor
    }
  };
}, ({
  disabled
}) => {
  if (disabled) {
    return {
      backgroundColor: colorGreyAthens,
      borderColor: "transparent",
      "&:not(:focus)": {
        borderColor: "transparent"
      }
    };
  }
  return {};
});
const StyledFeedbackIcon$1 = styled.div({
  right: "1rem"
}, absolute, centerVertically);

// FeedbackIcon component

const StyledIcon$1 = styled.div({
  lineHeight: 1
});

const renderIcon$1 = feedback => {
  if (feedback === "success") {
    return /*#__PURE__*/React.createElement(NotificationSuccess, {
      copy: {
        a11yText: "The value of this input field is valid."
      }
    });
  }
  if (feedback === "error") {
    return /*#__PURE__*/React.createElement(NotificationError, {
      copy: {
        a11yText: "The value of this input field is invalid."
      }
    });
  }
  return null;
};
const FeedbackIcon = ({
  showIcon,
  feedback
}) => /*#__PURE__*/React.createElement(Fade, {
  timeout: 100,
  in: showIcon,
  mountOnEnter: true,
  unmountOnExit: true
}, () => /*#__PURE__*/React.createElement(StyledIcon$1, null, renderIcon$1(feedback)));
FeedbackIcon.propTypes = {
  showIcon: PropTypes.bool.isRequired,
  feedback: PropTypes.oneOf(["success", "error"])
};
FeedbackIcon.defaultProps = {
  feedback: undefined
};

const showFeedbackIcon$2 = feedback => feedback === "error" || feedback === "success";
const renderHint$2 = (hint, Component, id) => /*#__PURE__*/React.createElement(Component, {
  id: id,
  size: "small"
}, hint);
const renderError$3 = (error, errorId) => /*#__PURE__*/React.createElement(InputFeedback, {
  id: errorId,
  feedback: "error"
}, /*#__PURE__*/React.createElement(Paragraph, {
  size: "small"
}, error));
const renderLabel$2 = (id, label, hint, hintPosition, hintId, tooltip) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Box, {
  inline: true,
  between: 2
}, /*#__PURE__*/React.createElement("label", {
  htmlFor: id || generateId(label).identity()
}, /*#__PURE__*/React.createElement(StyledLabelContainer$2, {
  inline: true,
  tag: "span",
  between: 2
}, /*#__PURE__*/React.createElement(Text, {
  size: "medium",
  bold: true
}, label), hint && hintPosition === "inline" && renderHint$2(hint, Text, hintId))), tooltip && /*#__PURE__*/React.cloneElement(tooltip, {
  connectedFieldLabel: label
})), hint && hintPosition === "below" && renderHint$2(hint, Paragraph, hintId));
const renderHelper$2 = (helper, helperId, feedback, value) => {
  if (typeof helper === "function") {
    return /*#__PURE__*/React.createElement("div", {
      id: helperId
    }, /*#__PURE__*/React.createElement(Text, {
      size: "small"
    }, helper(feedback, value)));
  }
  return /*#__PURE__*/React.createElement(InputFeedback, {
    id: helperId,
    feedback: feedback
  }, /*#__PURE__*/React.createElement(Text, {
    size: "small"
  }, helper));
};
const Input = /*#__PURE__*/React.forwardRef(({
  id,
  value,
  type,
  label,
  hint,
  hintPosition,
  feedback,
  error,
  helper,
  tooltip,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const fieldId = generateId(id, rest.name, label);
  const errorId = error && fieldId.postfix("error-message");
  const helperId = helper && fieldId.postfix("helper");
  const hintId = hint && hintPosition === "below" && fieldId.postfix("hint") || undefined;
  const handleFocus = e => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  };
  const handleBlur = e => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };
  const handleKeyDown = e => {
    /**
     * this is a workaround for a bug in chrome that moves
     * the cursor into a wrong position if prepended with a space
     */
    if (type === "email" && e.key === " ") {
      e.preventDefault();
    }
    if (rest.onKeyDown) {
      rest.onKeyDown(e);
    }
  };
  return /*#__PURE__*/React.createElement(Box, {
    between: 2
  }, renderLabel$2(fieldId.identity(), label, hint, hintPosition, hintId, tooltip), helper && renderHelper$2(helper, helperId, feedback, value), error && renderError$3(error, errorId), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(StyledInput, _extends$1({}, safeRest(rest), {
    type: type,
    ref: ref,
    id: fieldId.identity(),
    value: value,
    feedback: feedback,
    "aria-invalid": feedback === "error",
    "aria-describedby": errorId || hintId || helperId || undefined,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown
  })), !rest.disabled && /*#__PURE__*/React.createElement(StyledFeedbackIcon$1, null, /*#__PURE__*/React.createElement(FeedbackIcon, {
    showIcon: showFeedbackIcon$2(feedback) && !isFocused,
    feedback: feedback
  }))));
});
Input.displayName = "Input";
Input.propTypes = {
  id: PropTypes.string,
  type: PropTypes.oneOf(["text", "number", "password", "email", "search", "tel", "url"]),
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  hintPosition: PropTypes.oneOf(["inline", "below"]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  feedback: PropTypes.oneOf(["success", "error"]),
  error: PropTypes.node,
  helper: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  tooltip: componentWithName("Tooltip", true)
};
Input.defaultProps = {
  id: undefined,
  type: "text",
  hint: undefined,
  hintPosition: "inline",
  value: undefined,
  feedback: undefined,
  error: undefined,
  tooltip: undefined,
  helper: undefined
};

// Returns an array of focusable elements in the order they are found in c
const selector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1']), audio[controls], video[controls], [contenteditable]:not([contenteditable=false])";
const getFocusable = c => c.querySelectorAll(selector);
const withFocusTrap = Component => {
  const WithFocusTrap = props => {
    const componentRef = React.useRef(null);

    // To force VoiceOver to treat the dialog as a modal we need to set the aria-label attribute.
    // Also the modal-dialog html needs to be inserted into the page using JS after the page loads (this isn't a real problem)
    const {
      a11yText,
      autofocus,
      ...rest
    } = props;
    React.useEffect(() => {
      if (autofocus) {
        // setting the focus to the first focusable element on mount only
        const focusableElements = componentRef.current && getFocusable(componentRef.current)[0];
        if (focusableElements) focusableElements.focus();
      }
    }, [autofocus]);
    const handleFocus = isEnd => () => {
      const focusableElements = getFocusable(componentRef.current);
      focusableElements[isEnd ? 0 : focusableElements.length - 1].focus();
    };
    return /*#__PURE__*/React.createElement("div", {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": a11yText
    }, /*#__PURE__*/React.createElement("div", {
      onFocus: handleFocus(false),
      tabIndex: 0
    }), /*#__PURE__*/React.createElement("div", {
      ref: componentRef
    }, /*#__PURE__*/React.createElement(Component, rest)), /*#__PURE__*/React.createElement("div", {
      onFocus: handleFocus(true),
      tabIndex: 0
    }));
  };
  WithFocusTrap.propTypes = {
    a11yText: PropTypes.string,
    autofocus: PropTypes.bool
  };
  WithFocusTrap.defaultProps = {
    a11yText: "modal dialog",
    autofocus: true
  };
  return WithFocusTrap;
};

// eslint-disable-next-line react/display-name
const withStyledComponent = StyledComponent => Component => props => {
  const WithStyledComponent = /*#__PURE__*/React.createElement(Component, _extends$1({}, props, {
    styledComponent: StyledComponent
  }));
  return WithStyledComponent;
};

const getDisplayName = Component => {
  return Component.displayName || Component.name || "Component";
};
const withForwardedRef = Component => {
  const WithForwardedRef = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(Component, _extends$1({}, props, {
    forwardedRef: ref
  })));
  WithForwardedRef.displayName = `WithForwardedRef(${getDisplayName(Component)})`;
  return WithForwardedRef;
};

const base = {
  ...focusOutline,
  "&:link,&:visited": {
    color: colorGreyShark,
    textDecoration: "underline"
  },
  "&:hover": {
    textDecoration: "none"
  },
  "& svg": {}
};
const states = ({
  invert
}) => {
  return {
    "&:active": {
      color: invert && colorGainsboro,
      backgroundColor: invert ? "rgba(0,0,0,0.4)" : colorGainsboro,
      borderRadius: "0.25rem",
      padding: "0.125rem",
      margin: "-0.125rem",
      textDecoration: "underline"
    },
    "&:focus": {
      border: `0.125rem solid ${invert ? colorWhite : colorGreyRaven}`,
      padding: "0.125rem",
      margin: "-0.25rem",
      // (border + padding) * -1
      borderRadius: "0.25rem",
      outline: "none"
    }
  };
};
const StyledLink = styled.a(base, {
  "& svg": {
    transition: "transform 150ms ease-in-out"
  },
  "&:hover svg": {
    transform: "scale(1.1, 1.1)"
  },
  "&:active svg": {
    transform: "scale(1, 1)"
  }
}, ({
  invert,
  context
}) => {
  if (context.inheritColor) {
    return {
      "&:link,&:visited": {
        color: "inherit"
      }
    };
  }
  if (invert) {
    return {
      "&:link,&:visited": {
        color: colorWhite
      }
    };
  }
  return {};
}, states, ({
  hasIcon
}) => {
  if (hasIcon) {
    return {
      display: "inline-block",
      "& > svg": {
        verticalAlign: "middle"
      }
    };
  }
  return {};
});
const Link = ({
  reactRouterLinkComponent,
  invert,
  children,
  forwardedRef,
  icon: Icon,
  iconPosition,
  ...rest
}, context) => {
  if (!(reactRouterLinkComponent && rest.to) && (reactRouterLinkComponent || rest.to)) {
    warn("Link", "The props `reactRouterLinkComponent` and `to` must be used together.");
  }
  const renderChildren = React.useCallback(() => {
    if (Icon) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, iconPosition === "left" && /*#__PURE__*/React.createElement(Icon, {
        color: invert ? "white" : "greyShark",
        style: {
          marginRight: "0.5rem"
        }
      }), children, iconPosition === "right" && /*#__PURE__*/React.createElement(Icon, {
        color: invert ? "white" : "greyShark",
        style: {
          marginLeft: "0.25rem"
        }
      }));
    }
    return children;
  }, [children, Icon, iconPosition, invert]);
  return /*#__PURE__*/React.createElement(StyledLink, _extends$1({}, safeRest(rest), {
    as: reactRouterLinkComponent || "a",
    invert: invert,
    context: context,
    ref: forwardedRef,
    hasIcon: !!Icon
  }), renderChildren());
};
Link.propTypes = {
  reactRouterLinkComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  href: PropTypes.string,
  invert: PropTypes.bool,
  children: PropTypes.node.isRequired,
  forwardedRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  icon: componentWithName("Dependent", true),
  iconPosition: PropTypes.oneOf(["left", "right"])
};
Link.defaultProps = {
  reactRouterLinkComponent: null,
  to: null,
  href: null,
  invert: undefined,
  forwardedRef: undefined,
  icon: undefined,
  iconPosition: "left"
};
Link.contextTypes = {
  inheritColor: PropTypes.bool
};
var Link$1 = withForwardedRef(Link);

const copyDictionary$5 = {
  en: {
    feedback: "en",
    close: "Close"
  },
  fr: {
    feedback: "fr",
    close: "Fermer"
  }
};

const StyledNotificationContainer = styled(({
  variant,
  ...rest
}) => /*#__PURE__*/React.createElement(Box, rest))(({
  variant
}) => ({
  position: "relative",
  ...{
    instructional: standard,
    success: success,
    error: error,
    warning: warning,
    branded: {
      backgroundColor: colorWhiteLilac
    }
  }[variant]
}));
const StyledIconContainer = styled(({
  ...rest
}) => /*#__PURE__*/React.createElement(Box, rest))({
  lineHeight: 0
});
const StyledDismissButtonWrapper = styled.div({
  marginLeft: "auto",
  height: "1.5rem",
  position: "relative",
  marginTop: "-0.5rem",
  marginRight: "-0.5rem"
});
const isImportant = variant => variant === "success" || variant === "error" || variant === "warning";
const renderIcon = (variant, copy) => {
  const feedback = getCopy(copyDictionary$5, copy).feedback;
  const iconCopy = typeof copy === "object" && copy.feedback ? {
    a11yText: feedback
  } : feedback;
  if (variant === "success") {
    return /*#__PURE__*/React.createElement(NotificationSuccess, {
      copy: iconCopy
    });
  }
  if (variant === "error") {
    return /*#__PURE__*/React.createElement(NotificationError, {
      copy: iconCopy
    });
  }
  if (variant === "warning") {
    return /*#__PURE__*/React.createElement(NotificationWarning, {
      copy: iconCopy
    });
  }
  return undefined;
};
class Notification extends React.Component {
  state = {
    dismissed: false,
    contentWrapperHeight: undefined
  };
  componentDidMount() {
    if (this.props.dismissible) {
      window.addEventListener("resize", this.adjustContentHeight);
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.adjustContentHeight);
  }
  adjustContentHeight = () => {
    if (this.contentWrapper && this.contentWrapper.offsetHeight !== this.state.contentWrapperHeight) {
      this.setState({
        contentWrapperHeight: this.contentWrapper.offsetHeight
      });
    }
  };
  renderNotification() {
    const {
      variant,
      dismissible,
      children,
      onExit,
      onDismiss,
      copy,
      ...rest
    } = this.props;
    return /*#__PURE__*/React.createElement(StyledNotificationContainer, _extends$1({}, safeRest(rest), {
      vertical: 3,
      variant: variant
    }), /*#__PURE__*/React.createElement(FlexGrid, null, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, null, /*#__PURE__*/React.createElement(FlexGrid, {
      gutter: false
    }, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, null, /*#__PURE__*/React.createElement(Box, {
      inline: true,
      between: 3
    }, /*#__PURE__*/React.createElement(Box, {
      inline: true,
      between: 3,
      style: {
        justifyContent: "center"
      }
    }, isImportant(variant) && /*#__PURE__*/React.createElement(StyledIconContainer, {
      vertical: 1
    }, renderIcon(variant, copy)), /*#__PURE__*/React.createElement(Paragraph, null, children)), dismissible && /*#__PURE__*/React.createElement(StyledDismissButtonWrapper, null, /*#__PURE__*/React.createElement(IconButton, {
      icon: Close$1,
      a11yText: getCopy(copyDictionary$5, copy).close,
      onClick: () => {
        this.setState(() => ({
          dismissed: true
        }));
        if (onDismiss) {
          onDismiss();
        }
      }
    }))))))))));
  }
  render() {
    const {
      variant,
      dismissible,
      onExit,
      onDismiss
    } = this.props;
    if (onExit && !dismissible) {
      warn("Notification", "The prop `onExit` must be used together with `dismissible`.");
    }
    if (onDismiss && !dismissible) {
      warn("Notification", "The prop `onDismiss` must be used together with `dismissible`.");
    }
    if (variant === "error" && dismissible) {
      warn("Notification", "Error notifications should not be dismissible.");
    }
    if (variant === "warning" && dismissible) {
      warn("Notification", "Warning notifications should not be dismissible.");
    }
    if (dismissible) {
      const fadeDuration = 500;
      const revealDuration = 400;
      return /*#__PURE__*/React.createElement(Reveal, {
        timeout: revealDuration,
        delay: fadeDuration,
        in: !this.state.dismissed,
        height: this.state.contentWrapperHeight || "auto",
        unmountOnExit: true
      }, () => /*#__PURE__*/React.createElement(Fade, {
        timeout: fadeDuration,
        in: !this.state.dismissed,
        onExited: onExit
      }, () => /*#__PURE__*/React.createElement("div", {
        ref: c => {
          this.contentWrapper = c;
        }
      }, this.renderNotification())));
    }
    return this.renderNotification();
  }
}
Notification.propTypes = {
  variant: PropTypes.oneOf(["instructional", "branded", "success", "error", "warning"]),
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    feedback: PropTypes.string.isRequired,
    close: PropTypes.string.isRequired
  })]).isRequired,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  onExit: PropTypes.func,
  children: PropTypes.node.isRequired
};
Notification.defaultProps = {
  variant: "instructional",
  dismissible: false,
  onDismiss: undefined,
  onExit: undefined
};

const StyledOrderedItem = styled.li(({
  size
}) => ({
  marginLeft: "-1rem",
  paddingLeft: "1rem",
  ...(size === "small" && {
    ...small,
    letterSpacing: "inherit"
  }),
  ...(size === "medium" && {
    ...medium,
    ...mediumFont
  }),
  ...(size === "large" && {
    ...large,
    ...largeFont,
    letterSpacing: "inherit"
  })
}));
const StyledOrderedItemText = styled.span(({
  size
}) => ({
  ...(size === "small" && {
    ...small,
    ...smallFont
  }),
  ...(size === "medium" && {
    ...medium,
    ...mediumFont
  }),
  ...(size === "large" && {
    ...large,
    ...largeFont
  })
}));
const OrderedItem = ({
  children,
  size,
  ...rest
}) => /*#__PURE__*/React.createElement(StyledOrderedItem, _extends$1({
  size: size
}, safeRest(rest)), /*#__PURE__*/React.createElement(StyledOrderedItemText, {
  size: size
}, children));
OrderedItem.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["small", "medium", "large"])
};
OrderedItem.defaultProps = {
  size: "medium"
};
OrderedItem.displayName = "OrderedList.Item";

const listStyleType = {
  upperAlpha: "upper-alpha",
  lowerAlpha: "lower-alpha",
  decimal: "decimal"
};
const StyledOrderedList = styled(({
  size,
  listStyle,
  ...rest
}) => /*#__PURE__*/React.createElement(Box, rest))(({
  listStyle
}) => ({
  paddingLeft: "3rem",
  listStyleType: listStyleType[listStyle],
  ...base$2
}));
const OrderedList = ({
  listStyle,
  size,
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(StyledOrderedList, _extends$1({}, safeRest(rest), {
  tag: "ol",
  between: 2,
  listStyle: listStyle
}), React.Children.toArray(children).filter(child => child).map(child => /*#__PURE__*/React.cloneElement(child, {
  size
})));
OrderedList.propTypes = {
  listStyle: PropTypes.oneOf(["decimal", "upperAlpha", "lowerAlpha"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  children: componentWithName("OrderedItem").isRequired
};
OrderedList.defaultProps = {
  listStyle: "decimal",
  size: "medium"
};
OrderedList.Item = OrderedItem;

const StyledImage = styled.img({
  height: "auto",
  maxWidth: "100%"
});
const StyledRoundedImage = styled(StyledImage)(rounded);
const StyledCircularImage = styled(StyledImage)(circular);
const Image = ({
  src,
  width,
  height,
  alt,
  rounded,
  ...rest
}) => {
  const isCircle = rounded === "circle";
  const isCorners = rounded === "corners";
  const isSquare = width === height;
  if (isCircle && !isSquare) {
    warn("Image", "rounded=circle is not supported for non-square images. Please provide a square image, otherwise the resulting shape will not be a circle.");
  }
  let ImageComponent;
  if (isCircle) {
    ImageComponent = StyledCircularImage;
  } else if (isCorners) {
    ImageComponent = StyledRoundedImage;
  } else {
    ImageComponent = StyledImage;
  }
  return /*#__PURE__*/React.createElement(ImageComponent, _extends$1({}, safeRest(rest), {
    src: src,
    width: width,
    height: height,
    alt: alt
  }));
};
Image.propTypes = {
  /**
   * The src attribute for the HTML img element.
   */
  src: PropTypes.string.isRequired,
  /**
   * The alt attribute for the HTML img element. Setting this attribute to an empty string (alt="") indicates that this image is not a key part of the content, and that non-visual browsers may omit it from rendering.
   */
  alt: PropTypes.string.isRequired,
  /**
   * The image's width.
   */
  width: PropTypes.number.isRequired,
  /**
   * The image's height.
   */
  height: PropTypes.number,
  /**
   * Make image render as a circle or with rounded corners.
   */
  rounded: PropTypes.oneOf(["circle", "corners"])
};
Image.defaultProps = {
  rounded: undefined,
  height: undefined
};

const getVariant = ({
  variant
}) => {
  if (["white", "default", "defaultWithBorder", "defaultOnlyBorder"].indexOf(variant) >= 0) {
    return {
      boxShadow: variant === "defaultOnlyBorder" ? undefined : "0 0 16px 0 rgba(0, 0, 0, 0.1)",
      backgroundColor: colorWhite,
      border: variant === "defaultWithBorder" || variant === "defaultOnlyBorder" ? `1px solid ${colorGreyGainsboro}` : undefined
    };
  }
  if (variant === "lavender" || variant === "branded") {
    return {
      backgroundColor: colorWhiteLilac
    };
  }
  return {
    backgroundColor: colorGreyAthens
  };
};
const deprecationWarning = deprecatedVariant => {
  const variants = {
    white: "default",
    lavendar: "branded",
    grey: "alternative"
  };
  return `The ${deprecatedVariant} variant has been deprecated. Please use the '${variants[deprecatedVariant]}' variant.`;
};
const StyledCard = styled(({
  fullHeight,
  ...props
}) => /*#__PURE__*/React.createElement(Box, props))(none, rounded, getVariant, ({
  fullHeight
}) => {
  if (fullHeight) {
    return {
      height: "100%"
    };
  }
  return {};
});
const fullBleedImageStyles = fullBleedImage => fullBleedImage && fullBleedImage.position && handleResponsiveStyles({
  position: fullBleedImage.position
}, ({
  position
}) => {
  if (!fullBleedImage) return {};
  const direction = {
    left: "row",
    right: "row-reverse",
    top: "column",
    bottom: "column-reverse",
    none: "row"
  };
  const styles = {
    display: "flex",
    flexDirection: direction[position],
    justifyContent: "space-between",
    "> img": {
      display: position === "none" ? "none" : "block",
      margin: "auto"
    }
  };
  return styles;
});
const StyledImageCard = styled(({
  fullBleedImage,
  ...props
}) => /*#__PURE__*/React.createElement("div", props))(({
  fullBleedImage
}) => fullBleedImageStyles(fullBleedImage));
const Card = ({
  variant,
  children,
  fullHeight,
  spacing,
  fullBleedImage,
  ...rest
}) => {
  if (variant === "white" || variant === "lavendar" || variant === "grey") {
    deprecate("core-card", deprecationWarning(variant));
  }
  const spacingProps = {};
  if (spacing === "default") {
    spacingProps.vertical = 5;
    spacingProps.horizontal = 4;
  } else if (spacing === "narrow") {
    spacingProps.vertical = 4;
    spacingProps.horizontal = 3;
  } else if (spacing === "compact") {
    spacingProps.inset = 3;
  } else if (spacing === "intermediate") {
    spacingProps.inset = 4;
  }
  if (fullBleedImage) {
    return /*#__PURE__*/React.createElement(StyledCard, _extends$1({}, safeRest(rest), {
      fullHeight: fullHeight,
      variant: variant
    }), /*#__PURE__*/React.createElement(StyledImageCard, {
      fullBleedImage: fullBleedImage
    }, /*#__PURE__*/React.createElement(Image, {
      src: fullBleedImage.src,
      width: fullBleedImage.width,
      height: fullBleedImage.height,
      alt: fullBleedImage.alt
    }), /*#__PURE__*/React.createElement(Box, spacingProps, children)));
  }
  return /*#__PURE__*/React.createElement(StyledCard, _extends$1({}, safeRest(rest), {
    fullHeight: fullHeight,
    variant: variant
  }, spacingProps), children);
};
Card.propTypes = {
  variant: PropTypes.oneOf(["white", "lavender", "grey", "default", "branded", "alternative", "defaultWithBorder", "defaultOnlyBorder"]),
  children: PropTypes.node.isRequired,
  fullHeight: PropTypes.bool,
  spacing: PropTypes.oneOf(["default", "narrow", "compact", "intermediate"]),
  fullBleedImage: PropTypes.shape({
    src: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    alt: PropTypes.string.isRequired,
    position: responsiveProps(PropTypes.oneOf(["left", "right", "top", "bottom", "none"])).isRequired
  })
};
Card.defaultProps = {
  variant: "default",
  fullHeight: false,
  spacing: "default",
  fullBleedImage: undefined
};

const Requirement = ({
  value,
  requirement
}) => {
  const [isValid, setIsValid] = React.useState();
  React.useEffect(() => {
    setIsValid(requirement.validator(value));
  }, [value, requirement]);
  return /*#__PURE__*/React.createElement(Box, {
    inline: true,
    between: 2
  }, isValid ? /*#__PURE__*/React.createElement(Checkmark, null) : /*#__PURE__*/React.createElement(Times, null), /*#__PURE__*/React.createElement(Text, null, requirement.text));
};
Requirement.propTypes = {
  value: PropTypes.string,
  requirement: PropTypes.shape({
    validator: PropTypes.func,
    text: PropTypes.string
  })
};

const Requirements = ({
  value,
  requirements,
  onValidChange
}) => {
  const validChangeCb = React.useCallback(onValidChange, []);
  React.useEffect(() => {
    validChangeCb(requirements?.every(r => r.validator(value)));
  }, [value, requirements, validChangeCb]);
  return /*#__PURE__*/React.createElement(InputFeedback, null, requirements?.map((r, index) => /*#__PURE__*/React.createElement(Requirement, {
    key: index,
    value: value,
    requirement: r,
    onValidChange: onValidChange
  })));
};
Requirements.propTypes = {
  value: PropTypes.string,
  requirements: PropTypes.arrayOf(PropTypes.shape({
    validator: PropTypes.func,
    text: PropTypes.string
  })),
  onValidChange: PropTypes.func
};

const copyDictionary$4 = {
  en: {
    heading: "Ready to take the next step?",
    onSuccessHeading: "We have identified an account that corresponds with your username.",
    subtext: "Create an account or sign in.",
    paragraph: "By creating an account or logging in, you understand and agree to our Terms. You also acknowledge our Cookie and Privacy policies. You will receive marketing messages from Indeed and may opt out at any time by following the unsubscribe link in our messages, or as detailed in our terms.",
    username: "Username",
    password: "Password",
    email: "Email",
    confirmPassword: "Confirm password",
    secureCode: "Security code",
    continueCTA: "Create an account",
    signUpCTA: "Sign up",
    signInCTA: "Sign in to your account",
    securityCodeCTA: "Continue",
    createTicket: "Having issues submit a ticket",
    emptyField: "This field can not be empty.",
    submitSecureCodeCTATxt: "Submit code",
    error500: "Internal Server Error: We're working to fix it. Please try again later.",
    pwdForgotTxt: "Forgot password ?",
    usernameForgotTxt: "Username forgot ?",
    employeeId: "Employee ID",
    companyOREmployeeIDNotFoundTxt: "Account does not exists ! Contact us."
  },
  fr: {
    heading: "Prêt à passer à l'étape suivante ?",
    onSuccessHeading: "Nous avons identifié un compte correspondant à votre nom d'utilisateur.",
    subtext: "Créez un compte ou connectez-vous.",
    paragraph: "En créant un compte ou en vous connectant, vous comprenez et acceptez nos Conditions. Vous reconnaissez également nos politiques en matière de Cookies et de Confidentialité. Vous recevrez des messages marketing de Indeed et pourrez vous désabonner à tout moment en suivant le lien de désinscription dans nos messages ou en consultant nos conditions détaillées.",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    email: "Adresse e-mail",
    confirmPassword: "Confirmez le mot de passe",
    secureCode: "Code de sécurité",
    continueCTA: "Créer un compte",
    signUpCTA: "S'inscrire",
    signInCTA: "Se connecter à votre compte",
    securityCodeCTA: "Continuer",
    createTicket: "Rencontrez-vous des problèmes? Soumettez une requete",
    emptyField: "Veuillez remplir ce champ.",
    submitSecureCodeCTATxt: "Soumettre",
    error500: "Erreur interne du serveur : Nous travaillons à sa résolution. Veuillez réessayer ultérieurement.",
    pwdForgotTxt: "Mot de passe oublié ?",
    usernameForgotTxt: "Nom d'utilisateur oublié ?",
    employeeId: "Numero d'employer",
    companyOREmployeeIDNotFoundTxt: "Le compte n'existe pas ! Contactez-nous."
  }
};

const keyframes = require("styled-components").keyframes;
const zindexPopover = 1600;
const spinnerRotate = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;
const spinnerDash = keyframes`
  0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dasharray: 89, 200;
      stroke-dashoffset: -124;
    }
`;
const SvgContainer = styled.div(({
  overlay
}) => ({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center",
  ...(overlay && {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: zindexPopover
  })
}));
const StyledSvg = styled.svg`
  animation: ${spinnerRotate} 1.8s linear infinite;
  ${({
  size
}) => size === "small" && "height: 3.125rem; width: 3.125rem;"}
  ${({
  size
}) => size === "large" && "height: 6.25rem; width: 6.25rem;"}
`;
const SvgCircle = styled.circle`
  animation: ${spinnerDash} 1.7s ease-in-out infinite 0s;
  ${({
  variant
}) => variant === "primary" && `stroke: ${colorAccessibleGreen}`}
  ${({
  variant
}) => variant === "secondary" && `stroke: ${colorSecondary}`}
`;
const TipContainer = styled.div({
  marginTop: "-1.5rem"
});
const SpinnerSvg = ({
  tip,
  overlay,
  a11yLabel,
  size,
  variant,
  labelRef,
  ...rest
}) => {
  const titleId = uniqueId("spinner-title-");
  return /*#__PURE__*/React.createElement(SvgContainer, {
    overlay: overlay,
    "data-testid": "spinner"
  }, /*#__PURE__*/React.createElement(StyledSvg, _extends$1({}, safeRest(rest), {
    viewBox: "0 0 100 100",
    width: size === "large" ? "100" : "50",
    height: size === "large" ? "100" : "50",
    role: "alert",
    "aria-labelledby": titleId,
    "aria-live": "assertive",
    "data-testid": "svg"
  }), /*#__PURE__*/React.createElement("title", {
    id: titleId
  }, a11yLabel), /*#__PURE__*/React.createElement(SvgCircle, {
    variant: size === "small" ? variant : "primary",
    strokeWidth: "4",
    fill: "none",
    strokeLinecap: "round",
    strokeDasharray: "89, 200",
    strokeDashoffset: "0",
    cx: "50",
    cy: "50",
    r: "20"
  })), tip && /*#__PURE__*/React.createElement(TipContainer, {
    tabIndex: "-1",
    ref: labelRef
  }, /*#__PURE__*/React.createElement(Text, {
    size: "small"
  }, tip)));
};
SpinnerSvg.propTypes = {
  tip: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  overlay: PropTypes.bool,
  a11yLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  size: PropTypes.oneOf(["large", "small"]).isRequired,
  variant: PropTypes.oneOf(["primary", "secondary"]).isRequired,
  labelRef: PropTypes.object
};
SpinnerSvg.defaultProps = {
  tip: undefined,
  overlay: false,
  labelRef: undefined
};

const zindexModalBackdrop = 1400;
const SpinnerContainer = styled.div(({
  inline,
  fullScreen
}) => ({
  ...relative,
  ...(inline && {
    display: "block",
    ...media.from("md").css({
      display: "inline-block"
    })
  }),
  ...(fullScreen && centerVertically)
}));
const ContentOverlay = styled.div({
  position: "absolute",
  width: "100%",
  height: "100%",
  zIndex: zindexModalBackdrop
});
const FullscreenOverlay = styled.div({
  position: "fixed",
  width: "100vw",
  height: "100vh",
  top: 0,
  left: 0,
  zIndex: zindexModalBackdrop,
  backgroundColor: "rgba(255, 255, 255, 0.96)"
});
const OpaqueContainer = styled.div({
  opacity: 0.06
});
const recursiveMap = (children, fn) => React.Children.map(children, child => {
  if (! /*#__PURE__*/React.isValidElement(child)) {
    return child;
  }
  if (child.props.children) {
    return fn( /*#__PURE__*/React.cloneElement(child, {
      children: recursiveMap(child.props.children, fn)
    }));
  }
  return fn(child);
});
class Spinner extends React.PureComponent {
  constructor() {
    super();
    this.spinnerOverlayRef = null;
  }
  componentDidUpdate() {
    if (this.props.fullScreen && this.props.spinning) {
      document.body.addEventListener("touchmove", this.preventScroll, {
        passive: false
      });
      document.body.addEventListener("touchstart", this.preventScroll, {
        passive: false
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.removeEventListener("touchmove", this.preventScroll);
      document.body.removeEventListener("touchstart", this.preventScroll);
      document.body.style.overflow = "auto";
    }
  }
  preventScroll = e => {
    if (this.spinnerOverlayRef.current.contains(e.targetTouches[0].target)) {
      e.preventDefault();
    }
  };
  render() {
    const {
      spinning,
      label,
      dangerouslyHideVisibleLabel,
      tip,
      a11yLabel,
      inline,
      size,
      variant,
      fullScreen,
      labelRef,
      children,
      ...rest
    } = this.props;
    if (tip) {
      deprecate("core-spinner", "The `tip` prop is deprecated. Please use the `label` prop.");
    }
    if (a11yLabel && label === undefined) {
      deprecate("core-spinner", "The `a11yLabel` prop is deprecated. Please use the `label` prop.");
    }
    if (size === "large" && variant === "secondary") {
      warn("core-spinner", "The Spinner should not use the `secondary` variant while `size` is set to `large`.");
    }
    if (!spinning) {
      return children || null;
    }
    const spinnerSvg = props => {
      return /*#__PURE__*/React.createElement(SpinnerSvg, _extends$1({}, props, safeRest(rest), {
        tip: dangerouslyHideVisibleLabel || size === "small" ? undefined : label || tip,
        a11yLabel: label || a11yLabel,
        size: size,
        variant: variant,
        labelRef: labelRef
      }));
    };
    if (fullScreen) {
      return /*#__PURE__*/React.createElement(FullscreenOverlay, {
        ref: el => {
          this.spinnerOverlayRef = el;
        },
        "data-testid": "overlay"
      }, /*#__PURE__*/React.createElement(SpinnerContainer, {
        inline: inline,
        fullScreen: fullScreen,
        "data-testid": "container",
        "aria-live": "assertive"
      }, spinnerSvg({
        overlay: true
      })));
    }
    if (children) {
      return /*#__PURE__*/React.createElement(SpinnerContainer, {
        inline: inline,
        fullScreen: fullScreen,
        "data-testid": "container",
        "aria-live": "assertive"
      }, spinnerSvg({
        overlay: true
      }), /*#__PURE__*/React.createElement(ContentOverlay, {
        "data-testid": "overlay"
      }), /*#__PURE__*/React.createElement(OpaqueContainer, {
        inert: "true"
      }, recursiveMap(children, c => {
        if (c) {
          return /*#__PURE__*/React.cloneElement(c, {
            tabIndex: "-1",
            "aria-hidden": "true"
          });
        }
        return undefined;
      })));
    }
    return spinnerSvg();
  }
}
Spinner.propTypes = {
  spinning: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  dangerouslyHideVisibleLabel: PropTypes.bool,
  tip: PropTypes.string,
  a11yLabel: PropTypes.string,
  inline: PropTypes.bool,
  size: PropTypes.oneOf(["large", "small"]),
  variant: PropTypes.oneOf(["primary", "secondary"]),
  fullScreen: PropTypes.bool,
  children: PropTypes.node,
  labelRef: PropTypes.object
};
Spinner.defaultProps = {
  spinning: false,
  label: undefined,
  dangerouslyHideVisibleLabel: false,
  tip: undefined,
  a11yLabel: "A spinner is active. Please wait while the page completes a task.",
  inline: false,
  size: "large",
  variant: "primary",
  fullScreen: false,
  children: undefined,
  labelRef: undefined
};

const Login = ({
  variantType,
  cardVariant,
  checkUsernameOrEmailExists,
  sendLoginData,
  send2FALoginData,
  sendSignUPData,
  copy,
  policies,
  fullHeight,
  spacing,
  ...rest
}) => {
  const [username, setUsername] = React.useState("");
  const [userExists, setUserExists] = React.useState(false);
  const [usernameIsCkecked, setUsernameIsChecked] = React.useState(false);
  const [error, setError] = React.useState(undefined);
  const [status, setStatus] = React.useState(undefined);
  const [password, setPassword] = React.useState("");
  const [statusPwd, setStatusPwd] = React.useState(undefined);
  const [errorPwd, setErrorPwd] = React.useState(undefined);
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [statusConfirmPwd, setStatusConfirmPwd] = React.useState(undefined);
  const [isValid, setValid] = React.useState(false);
  const [secureCode, setSecureCode] = React.useState("");
  const [statusSecureCode, setStatusSecureCode] = React.useState(undefined);
  const [errorSecureCode, setErrorSecureCode] = React.useState(undefined);
  const [email, setEmail] = React.useState("");
  const [statusEmail, setStatusEmail] = React.useState(undefined);
  const [errorEmail, setErrorEmail] = React.useState(undefined);
  const [has2FALoading, setHas2FALoading] = React.useState(false);
  const [has2FA, setHas2FA] = React.useState(false);
  const [userNotExistAndContinueToRegister, setNextStep] = React.useState(false);
  const [isLoginComplete, setIsLoginComplete] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const content = getCopy(copyDictionary$4, copy);
  const contentPolicies = getCopy(policies, copy);
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const passwordRequirements = [{
    text: "Must be at least 8 characters",
    validator: val => val.length >= 8
  }, {
    text: "Must contain at least one number",
    validator: val => /\d/g.test(val)
  }, {
    text: "Must contain at least one lower-case letter",
    validator: val => /[a-z]/g.test(val)
  }, {
    text: "Must contain at least one upper-case letter",
    validator: val => /[A-Z]/g.test(val)
  }, {
    text: "Must contain at least one special character (@$%!#)",
    validator: val => /[@$%!#]/g.test(val)
  }];
  const onDataFilling = e => {
    let text = e?.target?.name;
    switch (text) {
      case "username":
        setUsername(e.target.value);
        if (username.length > 3) {
          setError(undefined);
          setStatus(undefined);
        }
        break;
      case "password":
        setPassword(e.target.value);
        if (password?.length > 0 && password.length < 8) {
          setValid(false);
          setErrorPwd(undefined);
        } else if (isValid) {
          setErrorPwd(undefined);
          setStatusPwd(undefined);
        }
        break;
      case "confirmPassword":
        setConfirmPassword(e.target.value);
        break;
      case "email":
        setEmail(e.target.value);
        if (emailPattern.test(email)) {
          setStatusEmail(undefined);
          setErrorEmail(undefined);
        }
        break;
      case "secureCode":
        setSecureCode(e.target.value);
        break;
    }
  };
  const validate = event => {
    const value = event.target.value;
    let text = event?.target?.name;
    switch (text) {
      case "username":
        if (value.length <= 3) {
          setError(content?.emptyField);
          setStatus("error");
          setUserExists(false);
        } else {
          setError(undefined);
          setStatus(undefined);
          const response = checkUsernameOrEmailExists(username);
          if (response?.success || response?.error) {
            setUsernameIsChecked(true);
          }
          if (response?.success) {
            setUserExists(true);
            setStatus("success");
          }
          if (variantType != "regular" && response?.error) {
            setSuccessMessage(null);
            setErrorMessage({
              ...response?.error,
              message: content?.companyOREmployeeIDNotFoundTxt
            });
          } else {
            setErrorMessage(null);
          }
        }
        break;
      case "email":
        if (!emailPattern.test(email)) {
          setStatusEmail("error");
          setErrorEmail("Incorect email formatting !");
        } else {
          setStatusEmail(undefined);
          setErrorEmail(undefined);
        }
        break;
      case "password":
        if (!value.length) {
          setErrorPwd(content?.emptyField);
          setStatusPwd("error");
        } else {
          setErrorPwd(undefined);
          setStatusPwd(undefined);
        }
        break;
      case "confirmPassword":
        if (confirmPassword != password) {
          setStatusConfirmPwd("error");
        } else {
          setStatusConfirmPwd("success");
        }
        break;
    }
  };
  const continueCTA = e => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setNextStep(true);
  };
  const signUpCTA = e => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    if (statusConfirmPwd == "success" && isValid && !errorEmail && !userExists) {
      const response = sendSignUPData({
        username,
        email,
        password
      });
      if (response?.success) {
        setIsLoginComplete(true);
        console.log("We are here", response);
        setSuccessMessage(response?.success);
      }
      if (response?.error) {
        setErrorMessage(response?.error);
      }
    }
  };
  const signInCTA = e => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    if (password.length < 1) {
      setErrorPwd(content?.emptyField);
      setStatusPwd("error");
    } else if (username.length && password.length) {
      setHas2FALoading(true);
      const response = sendLoginData({
        username,
        password
      });
      if (response?.success) {
        setHas2FALoading(false);
        setSuccessMessage(response?.success);
        setStatus(undefined);
        if (response?.data?.has2FA) {
          setHas2FA(true);
        } else {
          setIsLoginComplete(true);
        }
      }
      if (response?.error) {
        setHas2FALoading(false);
        setErrorMessage(response?.error);
        setStatusPwd("error");
        setPassword("");
        setStatus(undefined);
      }
    }
  };
  const renderGeneralError = () => {
    if (successMessage?.status >= 200 && successMessage?.status <= 299) {
      return /*#__PURE__*/React.createElement(Notification, {
        variant: "success",
        copy: copy,
        "data-testid": "notification-success"
      }, /*#__PURE__*/React.createElement(Text, {
        small: true
      }, " ", successMessage?.message));
    } else if (errorMessage?.status >= 400 && errorMessage?.status <= 499) {
      return /*#__PURE__*/React.createElement(Notification, {
        variant: "error",
        copy: copy,
        "data-testid": "notification-error"
      }, /*#__PURE__*/React.createElement(Text, {
        small: true
      }, " ", errorMessage?.message));
    } else {
      return /*#__PURE__*/React.createElement(Notification, {
        variant: "warning",
        copy: copy,
        "data-testid": "notification-warning"
      }, /*#__PURE__*/React.createElement(Text, {
        small: true
      }, " ", content?.error500));
    }
  };
  const submitSecureCodeCTA = e => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    if (secureCode.length < 6 && secureCode > 6) {
      setErrorSecureCode("Code invalid");
      setStatusSecureCode("error");
    } else {
      const response = send2FALoginData({
        username,
        password,
        secureCode
      });
      if (response?.success) {
        setErrorSecureCode(undefined);
        setStatusSecureCode("success");
        setSuccessMessage(response?.success);
        setIsLoginComplete(true);
      } else if (response?.error) {
        setErrorSecureCode(undefined);
        setStatusSecureCode("error");
        setErrorMessage(response?.error);
      }
    }
  };
  return /*#__PURE__*/React.createElement(FlexGrid, null, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, {
    xs: 12,
    md: 8
  }, /*#__PURE__*/React.createElement(Card, _extends$1({
    variant: cardVariant
  }, safeRest(rest), {
    fullHeight: fullHeight
  }), /*#__PURE__*/React.createElement(Box, {
    between: 3
  }, (errorMessage || successMessage) && isLoginComplete && userNotExistAndContinueToRegister ? renderGeneralError() : null, !has2FA && variantType == "regular" && !userNotExistAndContinueToRegister ? !userExists ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Heading, {
    level: "h3"
  }, content?.heading), /*#__PURE__*/React.createElement(Text, {
    size: "medium"
  }, content?.subtext)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Heading, {
    level: "h3"
  }, content?.onSuccessHeading)) : null, !userNotExistAndContinueToRegister && /*#__PURE__*/React.createElement(React.Fragment, null, variantType == "regular" && !has2FA ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Paragraph, null, content?.paragraph), /*#__PURE__*/React.createElement(Box, {
    inline: true,
    between: 4
  }, contentPolicies?.map((policy, index) => /*#__PURE__*/React.createElement(Paragraph, {
    size: "small",
    key: index
  }, /*#__PURE__*/React.createElement(Link$1, {
    href: policy?.linkTo
  }, policy?.text)))), /*#__PURE__*/React.createElement(HairlineDivider, null)) : null, errorMessage || successMessage ? renderGeneralError() : null, !isLoginComplete ? !has2FA ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
    type: "text",
    hintPosition: "below",
    label: variantType != "regular" ? content?.employeeId : content?.username,
    name: "username",
    autocomplete: true,
    onChange: onDataFilling,
    onBlur: validate,
    value: username,
    feedback: status,
    error: error,
    "data-testid": "username"
  }), userExists && /*#__PURE__*/React.createElement(Input, {
    type: "password",
    hintPosition: "below",
    label: content?.password,
    name: "password",
    autocomplete: false,
    onChange: onDataFilling,
    onBlur: validate,
    value: password,
    feedback: statusPwd,
    error: errorPwd,
    "data-testid": "pwd"
  })) : /*#__PURE__*/React.createElement(Input, {
    type: "number",
    hintPosition: "below",
    label: content?.secureCode,
    name: "secureCode",
    autocomplete: true,
    onChange: onDataFilling,
    onBlur: validate,
    value: secureCode,
    feedback: statusSecureCode,
    error: errorSecureCode,
    "data-testid": "secure-code-input"
  }) : null), !isLoginComplete && !userExists && userNotExistAndContinueToRegister && variantType == "regular" ? /*#__PURE__*/React.createElement(React.Fragment, null, errorMessage || successMessage ? renderGeneralError() : null, /*#__PURE__*/React.createElement(Input, {
    type: "email",
    hintPosition: "below",
    label: content?.email,
    name: "email",
    onChange: onDataFilling,
    onBlur: validate,
    value: email,
    feedback: statusEmail,
    error: errorEmail,
    "data-testid": "email-input"
  }), !userExists && usernameIsCkecked && password?.length && !isValid ? /*#__PURE__*/React.createElement(Requirements, {
    value: password,
    requirements: passwordRequirements,
    onValidChange: isValid => setValid(isValid)
  }) : null, /*#__PURE__*/React.createElement(Input, {
    type: "password",
    hintPosition: "below",
    label: content?.password,
    name: "password",
    onChange: onDataFilling,
    onBlur: validate,
    value: password,
    feedback: statusPwd,
    error: errorPwd,
    "data-testid": "password-input"
  }), /*#__PURE__*/React.createElement(Input, {
    type: "password",
    hintPosition: "below",
    label: content?.confirmPassword,
    name: "confirmPassword",
    onChange: onDataFilling,
    onBlur: validate,
    value: confirmPassword,
    feedback: statusConfirmPwd,
    autocomplete: "off",
    "data-testid": "confirm-pwd-input"
  })) : null, !isLoginComplete ? /*#__PURE__*/React.createElement(React.Fragment, null, !userExists && usernameIsCkecked && !userNotExistAndContinueToRegister && variantType == "regular" ? /*#__PURE__*/React.createElement(Button, {
    onClick: continueCTA,
    variant: "primary",
    "data-testid": "create-account-button"
  }, content?.continueCTA) : !userExists && usernameIsCkecked && userNotExistAndContinueToRegister ? /*#__PURE__*/React.createElement(Button, {
    onClick: signUpCTA,
    variant: "primary",
    "data-testid": "sign-up-button"
  }, content?.signUpCTA) : !userNotExistAndContinueToRegister && userExists && usernameIsCkecked & !has2FA ? /*#__PURE__*/React.createElement(Spinner, {
    label: "Loading user",
    size: "small",
    spinning: has2FALoading,
    inline: true
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: signInCTA,
    variant: "primary",
    "data-testid": "sign-in-button"
  }, content?.signInCTA)) : !userNotExistAndContinueToRegister && userExists && usernameIsCkecked & has2FA ? /*#__PURE__*/React.createElement(Spinner, {
    label: "Loading user",
    size: "small",
    spinning: has2FALoading,
    inline: true
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: submitSecureCodeCTA,
    variant: "primary",
    "data-testid": "sign-in-with-code-button"
  }, content?.submitSecureCodeCTATxt)) : null) : null, /*#__PURE__*/React.createElement(Box, {
    between: 1,
    vertical: 3
  }, !isLoginComplete ? variantType != "inHouse" && /*#__PURE__*/React.createElement(React.Fragment, null, userExists && !has2FA && /*#__PURE__*/React.createElement("div", {
    "data-testid": "link-pwd-forgot"
  }, /*#__PURE__*/React.createElement(ChevronLink, {
    href: "#"
  }, content?.pwdForgotTxt)), !userExists && !usernameIsCkecked && !userNotExistAndContinueToRegister && /*#__PURE__*/React.createElement("div", {
    "data-testid": "link-username-forgot"
  }, /*#__PURE__*/React.createElement(ChevronLink, {
    href: "#"
  }, content?.usernameForgotTxt))) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(ChevronLink, {
    href: "#"
  }, content?.createTicket))))))));
};
Login.propTypes = {
  variantType: PropTypes.oneOf(["regular", "inHouse", "Company"]).isRequired,
  cardVariant: PropTypes.oneOf(["white", "lavender", "grey", "default", "branded", "alternative", "defaultWithBorder", "defaultOnlyBorder"]),
  checkUsernameOrEmailExists: PropTypes.func,
  sendLoginData: PropTypes.func,
  send2FALoginData: PropTypes.func,
  sendSignUPData: PropTypes.func,
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    heading: PropTypes.string,
    onSuccessHeading: PropTypes.string,
    subtext: PropTypes.string,
    paragraph: PropTypes.string,
    username: PropTypes.string,
    password: PropTypes.string,
    email: PropTypes.string,
    confirmPassword: PropTypes.string,
    continueCTA: PropTypes.string,
    signUpCTA: PropTypes.string,
    signInCTA: PropTypes.string,
    securityCodeCTA: PropTypes.string,
    createTicket: PropTypes.string
  })]).isRequired,
  policies: PropTypes.shape({
    en: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      linkTo: PropTypes.string
    })),
    fr: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      linkTo: PropTypes.string
    }))
  }),
  fullHeight: PropTypes.bool,
  spacing: PropTypes.oneOf(["default", "narrow", "compact", "intermediate"])
};
Login.defaultProps = {
  variantType: "regular",
  cardVariant: "defaultWithBorder",
  copy: "en",
  fullHeight: false,
  checkUsernameOrEmailExists: user => {
    const username = ["moderator", "admin"];
    if (username?.includes(user)) {
      return {
        error: null,
        data: true,
        success: {
          status: 200,
          message: "We have sent you a code to your email address! "
        }
      };
    }
    return {
      success: null,
      data: false,
      error: {
        status: 404,
        message: "User does not exist! Create an account. "
      }
    };
  },
  sendLoginData: userData => {
    const {
      username,
      password
    } = userData;
    const name = ["moderator", "admin"];
    const pwd = "password";
    if (name.includes(username) && username == "moderator" && password == pwd) {
      return {
        error: null,
        data: {
          has2FA: true
        },
        success: {
          status: 200,
          message: "We have sent you a security code to your email address."
        }
      };
    } else if (name.includes(username) && username == "admin" && password == pwd) {
      return {
        error: null,
        data: {
          has2FA: false
        },
        success: {
          status: 200,
          message: "For more security activate the 2FA "
        }
      };
    } else if (name.includes(username) && (username == "moderator" || username == "admin") && password != pwd) {
      return {
        data: false,
        error: {
          status: 401,
          message: "Login failed!"
        }
      };
    }
    return null;
  },
  send2FALoginData: userData => {
    const {
      username,
      secureCode
    } = userData;
    const name = ["moderator", "admin"];
    const secure = 123456;
    console.log("test .. ", {
      username,
      secureCode
    });
    if (name.includes(username) && username == "moderator" && secureCode == secure) {
      return {
        error: null,
        data: true,
        success: {
          status: 200,
          message: "Loading user params . . ."
        }
      };
    } else if (name.includes(username) && username == "moderator" && secureCode != secure) {
      return {
        success: null,
        data: false,
        error: {
          status: 401,
          message: "Code incorrect"
        }
      };
    }
  },
  sendSignUPData: userData => {
    const {
      username,
      email,
      password
    } = userData;
    const emails = [];
    if (emails.includes(email)) {
      return {
        success: null,
        data: null,
        error: {
          status: 401,
          message: "Email already exists !"
        }
      };
    }
    return {
      error: null,
      data: {
        username,
        email,
        password
      },
      success: {
        status: 200,
        message: "Thanks for registering! Please check your email for an activation link"
      }
    };
  },
  policies: {
    en: [{
      text: "Terms",
      linkTo: "#"
    }, {
      text: "Cookie",
      linkTo: "#"
    }, {
      text: "Privacy",
      linkTo: "#"
    }],
    fr: [{
      text: "Conditions",
      linkTo: "#"
    }, {
      text: " Cookies",
      linkTo: "#"
    }, {
      text: "Confidentialité",
      linkTo: "#"
    }]
  }
};

const baseButton = {
  boxSizing: "border-box",
  padding: "0.25rem 0rem",
  cursor: "pointer",
  background: colorWhite,
  transition: "all 0.2s ease-in-out",
  position: "relative",
  borderRadius: "0.1875rem",
  color: colorGreyShark,
  textDecoration: "underline",
  borderStyle: "none",
  "&:hover": {
    textDecoration: "none"
  },
  "&:active": {
    background: colorGreyGainsboro,
    boxShadow: `0 0 0 0.125rem ${colorGreyGainsboro}`,
    textDecoration: "underline"
  },
  "&:focus": {
    outline: "none !important",
    boxShadow: `0 0 0 0.125rem ${colorGreyRaven}`
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none !important"
  }
};
const StyledTextButton = styled.button(baseButton, medium);
const TextButton = ({
  children,
  ...rest
}) => /*#__PURE__*/React.createElement(StyledTextButton, safeRest(rest), children);
TextButton.propTypes = {
  children: or([PropTypes.string, componentWithName("A11yContent")]).isRequired
};

const FakeRadio = styled.span({
  height: "1.25rem",
  width: "1.25rem",
  minHeight: "1.25rem",
  minWidth: "1.25rem",
  outline: 0,
  lineHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  marginTop: "0.125rem",
  transition: "border-color 0.1s linear, background-color 0.1s linear",
  borderRadius: "50%",
  ...thin,
  borderColor: colorGreyShuttle,
  backgroundColor: colorWhite,
  "& > i": {
    display: "none"
  }
});
const HiddenInput = styled.input({
  position: "absolute",
  width: "1.2rem",
  height: "1.2rem",
  margin: "2px 1px",
  opacity: "0",
  pointerEvents: "none"
});
const StyledLabel$1 = styled.label(({
  isError
}) => ({
  display: "flex",
  cursor: "pointer",
  ...(isError && {
    color: colorCardinal,
    [`${HiddenInput}:checked ~ &`]: {
      color: "initial"
    },
    [`div > ${FakeRadio}`]: {
      borderColor: colorCardinal
    }
  }),
  [`${HiddenInput}:focus ~ & > div > ${FakeRadio}`]: {
    boxShadow: `0 0 4px 1px ${colorGreyShuttle}`,
    borderColor: isError ? colorCardinal : colorWhite
  },
  [`${HiddenInput}:checked ~ & > div > ${FakeRadio}`]: {
    "& > span": {
      display: "block"
    },
    borderColor: colorGreyShuttle
  },
  [`${HiddenInput}:disabled ~ & > div > ${FakeRadio}`]: {
    borderColor: colorGreyGainsboro
  },
  [`${HiddenInput}:disabled ~ & > div > div`]: {
    color: colorGreyGainsboro
  }
}));
const InnerChecked = styled.span({
  width: "0.75rem",
  height: "0.75rem",
  borderRadius: "50%",
  backgroundColor: colorAccessibleGreen,
  display: "none"
});
const StyledLabelAndDescriptionBox = styled(Box)({
  width: "100%"
});
const renderError$2 = (error, errorId) => /*#__PURE__*/React.createElement(InputFeedback, {
  id: errorId,
  feedback: "error"
}, /*#__PURE__*/React.createElement(Paragraph, {
  size: "small"
}, error || ""));
const getGeneratedId = (name, value) => {
  return generateId(name).postfix(value);
};
const getErrorId = (name, value, id) => {
  return generateId(id || getGeneratedId(name, value)).postfix("error-message");
};
const Radio = /*#__PURE__*/React.forwardRef(({
  id,
  name,
  value,
  label,
  feedback,
  error,
  description,
  ...rest
}, ref) => /*#__PURE__*/React.createElement(Box, {
  between: 2
}, feedback === "error" && renderError$2(error, getErrorId(name, value, id)), /*#__PURE__*/React.createElement(HiddenInput, _extends$1({
  type: "radio",
  id: id || getGeneratedId(name, value),
  name: name,
  value: value,
  "aria-invalid": feedback === "error",
  "aria-describedby": feedback === "error" ? getErrorId(name, value, id) : undefined,
  "data-testid": "hidden-input",
  ref: ref
}, safeRest(rest))), /*#__PURE__*/React.createElement(StyledLabel$1, {
  isError: feedback === "error",
  htmlFor: id || getGeneratedId(name, value),
  "data-testid": "checkbox-label"
}, /*#__PURE__*/React.createElement(Box, {
  between: 3,
  inline: true
}, /*#__PURE__*/React.createElement(FakeRadio, {
  "data-testid": "fake-input"
}, /*#__PURE__*/React.createElement(InnerChecked, null)), /*#__PURE__*/React.createElement(StyledLabelAndDescriptionBox, {
  between: 2
}, /*#__PURE__*/React.createElement(ColoredTextProvider, null, /*#__PURE__*/React.createElement(Text, null, label)), description && /*#__PURE__*/React.createElement(Text, {
  size: "small"
}, description))))));
Radio.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).isRequired,
  checked: PropTypes.bool,
  id: PropTypes.string,
  description: PropTypes.string,
  feedback: PropTypes.oneOf(["error"]),
  error: PropTypes.string
};
Radio.defaultProps = {
  id: undefined,
  description: undefined,
  feedback: undefined,
  error: undefined,
  checked: undefined
};
Radio.displayName = "Radio";

const SelectWrapper = styled.div({
  backgroundColor: colorWhite,
  ...relative
});
const StyledSelect = styled.select({
  ...inputHeight,
  appearance: "none",
  "&::-ms-expand": {
    display: "none"
  },
  width: "100%",
  margin: 0,
  outline: 0,
  textOverflow: "ellipsis",
  borderColor: colorGreyShuttle,
  backgroundColor: colorWhite,
  "&::placeholder": {
    font: "inherit",
    letterSpacing: "inherit",
    lineHeight: "inherit",
    color: colorGreyShuttle
  }
}, ({
  showFeedbackIcon
}) => ({
  padding: `0.5rem ${showFeedbackIcon ? "4" : "3"}rem 0.5rem 1rem`
}), thin, rounded, font, medium, mediumFont, color, ({
  withFeedbackIcon
}) => ({
  "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
    appearance: "none",
    margin: 0
  },
  minHeight: inputHeight.height,
  maxHeight: inputHeight.height,
  padding: withFeedbackIcon ? "0.5rem 4rem 0.5rem 1rem" : "0.5rem 3rem 0.5rem 1rem"
}), {
  "&:focus": {
    borderColor: "transparent",
    boxShadow: `0 0 4px 1px ${colorGreyShuttle}`,
    backgroundColor: colorWhite
  }
}, ({
  feedback
}) => {
  let borderColor;
  if (feedback === "success") {
    borderColor = colorPrimary;
  } else if (feedback === "error") {
    borderColor = colorCardinal;
  }
  return {
    "&:not(:focus)": {
      borderColor
    }
  };
}, ({
  disabled
}) => {
  if (disabled) {
    return {
      backgroundColor: colorGreyAthens,
      borderColor: "transparent",
      "&:not(:focus)": {
        borderColor: "transparent"
      }
    };
  }
  return {};
});
const IconWrapper = styled(Box)({
  ...absolute,
  top: "50%",
  transform: "translateY(-50%)",
  right: "1rem",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  borderColor: "red"
});
const IconLineFix = styled.div({
  lineHeight: 1
});
const StyledLabelContainer$1 = styled(Box)({
  alignItems: "center"
});
const showFeedbackIcon$1 = feedback => feedback === "error" || feedback === "success";
const renderHint$1 = (hint, Component, id) => /*#__PURE__*/React.createElement(Component, {
  id: id,
  size: "small"
}, hint);
const renderError$1 = (error, errorId) => /*#__PURE__*/React.createElement(InputFeedback, {
  id: errorId,
  feedback: "error"
}, /*#__PURE__*/React.createElement(Paragraph, {
  size: "small"
}, error));
const renderLabel$1 = (id, label, hint, hintPosition, hintId, tooltip) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Box, {
  inline: true,
  between: 2
}, /*#__PURE__*/React.createElement("label", {
  htmlFor: id || generateId(label).identity()
}, /*#__PURE__*/React.createElement(StyledLabelContainer$1, {
  inline: true,
  tag: "span",
  between: 2
}, /*#__PURE__*/React.createElement(Text, {
  size: "medium",
  bold: true,
  "data-testid": "selectLabel"
}, label), hint && hintPosition === "inline" && renderHint$1(hint, Text, hintId))), tooltip && /*#__PURE__*/React.cloneElement(tooltip, {
  connectedFieldLabel: label
})), hint && hintPosition === "below" && renderHint$1(hint, Paragraph, hintId));
const renderHelper$1 = (helper, helperId, feedback, value) => {
  if (typeof helper === "function") {
    return /*#__PURE__*/React.createElement("div", {
      id: helperId
    }, /*#__PURE__*/React.createElement(Text, {
      size: "small"
    }, helper(feedback, value)));
  }
  return /*#__PURE__*/React.createElement(InputFeedback, {
    id: helperId,
    feedback: feedback
  }, /*#__PURE__*/React.createElement(Text, {
    size: "small"
  }, helper));
};
const renderOptions = opts => opts.map(({
  text,
  value: optValue,
  options
}) => {
  if (options) {
    return /*#__PURE__*/React.createElement("optgroup", {
      label: text,
      key: text
    }, renderOptions(options));
  }
  return /*#__PURE__*/React.createElement("option", {
    key: optValue,
    value: optValue
  }, text);
});
const Select = /*#__PURE__*/React.forwardRef(({
  id,
  options,
  placeholder,
  label,
  hint,
  hintPosition,
  value,
  defaultValue,
  feedback,
  error,
  helper,
  tooltip,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const fieldId = generateId(id, rest.name, label);
  const errorId = error && feedback === "error" && fieldId.postfix("error-message");
  const helperId = helper && fieldId.postfix("helper");
  const hintId = hint && fieldId.postfix("hint") || undefined;
  const handleFocus = e => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  };
  const handleBlur = e => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };
  return /*#__PURE__*/React.createElement(Box, {
    between: 2
  }, renderLabel$1(fieldId.identity(), label, hint, hintPosition, hintId, tooltip), helper && renderHelper$1(helper, helperId, feedback, value), error && feedback === "error" && renderError$1(error, errorId), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(SelectWrapper, null, /*#__PURE__*/React.createElement(StyledSelect, _extends$1({}, safeRest(rest), {
    ref: ref,
    id: fieldId.identity(),
    value: value,
    feedback: feedback,
    "aria-invalid": feedback === "error",
    "aria-describedby": errorId || hintId || helperId || undefined,
    onFocus: handleFocus,
    onBlur: handleBlur,
    defaultValue: value !== undefined ? undefined : defaultValue
  }), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), renderOptions(options)), !rest.disabled && /*#__PURE__*/React.createElement(IconWrapper, {
    inline: true,
    between: 1
  }, /*#__PURE__*/React.createElement(FeedbackIcon, {
    showIcon: showFeedbackIcon$1(feedback) && !isFocused,
    feedback: feedback
  }), /*#__PURE__*/React.createElement(IconLineFix, null, /*#__PURE__*/React.createElement(CaretDown, {
    variant: feedback === "error" ? "error" : undefined,
    size: 16
  }))))));
});
Select.displayName = "Select";
Select.propTypes = {
  id: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.string,
    options: PropTypes.array
  })).isRequired,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  hintPosition: PropTypes.oneOf(["inline", "below"]),
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  feedback: PropTypes.oneOf(["success", "error"]),
  error: PropTypes.string,
  helper: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  tooltip: componentWithName("Tooltip", true)
};
Select.defaultProps = {
  id: undefined,
  hint: undefined,
  hintPosition: "inline",
  placeholder: undefined,
  value: undefined,
  defaultValue: "",
  feedback: undefined,
  error: undefined,
  helper: undefined,
  tooltip: undefined
};

const widthLimit = {
  maxWidth: "100%",
  minWidth: "100%",
  minHeight: "208px",
  position: "relative"
};
const PreventWidthResize = styled.div({
  ...widthLimit
});
const StyledLabelContainer = styled(Box)({
  alignItems: "center"
});
const StyledTextArea = styled.textarea(widthLimit, {
  boxSizing: "border-box",
  width: "100%",
  margin: 0,
  outline: 0,
  textOverflow: "ellipsis",
  borderColor: colorGreyShuttle,
  "-ms-overflow-style": "-ms-autohiding-scrollbar",
  "&::placeholder": {
    font: "inherit",
    letterSpacing: "inherit",
    lineHeight: "inherit",
    color: colorGreyShuttle
  }
}, thin, rounded, font, medium, mediumFont, color, ({
  withFeedbackIcon
}) => ({
  "&::-webkit-inner-spin-button, &::-webkit-outer-spin-button": {
    appearance: "none",
    margin: 0
  },
  "-moz-appearance": "textfield",
  padding: withFeedbackIcon ? "0.5rem 3rem 0.5rem 1rem" : "0.5rem 1rem"
}), {
  "&:focus": {
    borderColor: "transparent",
    boxShadow: `0 0 4px 1px ${colorGreyShuttle}`,
    backgroundColor: colorWhite
  }
}, ({
  feedback
}) => {
  let borderColor;
  if (feedback === "success") {
    borderColor = colorPrimary;
  } else if (feedback === "error") {
    borderColor = colorCardinal;
  }
  return {
    "&:not(:focus)": {
      borderColor
    }
  };
}, ({
  disabled
}) => {
  if (disabled) {
    return {
      backgroundColor: colorGreyAthens,
      borderColor: "transparent",
      "&:not(:focus)": {
        borderColor: "transparent"
      }
    };
  }
  return {};
});
const StyledFeedbackIcon = styled.div(absolute, {
  right: "1rem",
  top: "0.5rem",
  overflow: "visible" // Prevents icon cut-off on Mobile Safari
});

const showFeedbackIcon = feedback => feedback === "error" || feedback === "success";
const renderHint = (hint, Component, id) => /*#__PURE__*/React.createElement(Component, {
  id: id,
  size: "small"
}, hint);
const renderError = (error, errorId) => /*#__PURE__*/React.createElement(InputFeedback, {
  id: errorId,
  feedback: "error"
}, /*#__PURE__*/React.createElement(Paragraph, {
  size: "small"
}, error));
const renderLabel = (id, label, hint, hintId, tooltip) => /*#__PURE__*/React.createElement(Box, {
  inline: true,
  between: 2
}, /*#__PURE__*/React.createElement("label", {
  htmlFor: id || generateId(label).identity()
}, /*#__PURE__*/React.createElement(StyledLabelContainer, {
  inline: true,
  tag: "span",
  between: 2
}, /*#__PURE__*/React.createElement(Text, {
  size: "medium",
  bold: true
}, label), hint && renderHint(hint, Text, hintId))), tooltip && /*#__PURE__*/React.cloneElement(tooltip, {
  connectedFieldLabel: label
}));
const renderHelper = (helper, helperId, feedback, value) => {
  if (typeof helper === "function") {
    return /*#__PURE__*/React.createElement("div", {
      id: helperId
    }, /*#__PURE__*/React.createElement(Text, {
      size: "small"
    }, helper(feedback, value)));
  }
  return /*#__PURE__*/React.createElement(InputFeedback, {
    id: helperId,
    feedback: feedback
  }, /*#__PURE__*/React.createElement(Text, {
    size: "small"
  }, helper));
};

/**
 * @version ./package.json
 */
const TextArea = /*#__PURE__*/React.forwardRef(({
  id,
  value,
  label,
  hint,
  feedback,
  error,
  helper,
  tooltip,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const fieldId = generateId(id, rest.name, label);
  const errorId = error && feedback === "error" && fieldId.postfix("error-message");
  const helperId = helper && fieldId.postfix("helper");
  const hintId = hint && fieldId.postfix("hint") || undefined;
  const handleFocus = e => {
    setIsFocused(true);
    if (rest.onFocus) {
      rest.onFocus(e);
    }
  };
  const handleBlur = e => {
    setIsFocused(false);
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };
  return /*#__PURE__*/React.createElement(Box, {
    between: 2
  }, renderLabel(fieldId.identity(), label, hint, hintId, tooltip), helper && renderHelper(helper, helperId, feedback, value), error && feedback === "error" && renderError(error, errorId), /*#__PURE__*/React.createElement(PreventWidthResize, null, /*#__PURE__*/React.createElement(StyledTextArea, _extends$1({}, safeRest(rest), {
    ref: ref,
    id: fieldId.identity(),
    value: value,
    feedback: feedback,
    "aria-invalid": feedback === "error",
    "aria-describedby": errorId || hintId || helperId || undefined,
    onFocus: handleFocus,
    onBlur: handleBlur,
    withFeedbackIcon: showFeedbackIcon
  })), !rest.disabled && /*#__PURE__*/React.createElement(StyledFeedbackIcon, null, /*#__PURE__*/React.createElement(FeedbackIcon, {
    showIcon: showFeedbackIcon(feedback) && !isFocused,
    feedback: feedback
  }))));
});
TextArea.displayName = "TextArea";
TextArea.propTypes = {
  /**
   * The id. If no `id` is provided, a default `id` will be generated using the `label`. "This is a label" will become "this-is-a-label". A passed in `id` will appear as entered with no additional formatting.
   */
  id: PropTypes.string,
  /**
   * The label.
   */
  label: PropTypes.string.isRequired,
  /**
   * Clarify the expected input.
   */
  hint: PropTypes.string,
  /**
   * Use `value` for controlled TextArea. For uncontrolled TextArea, use React's built-in `defaultValue` prop.
   * See examples below for more details.
   */
  value: PropTypes.string,
  /**
   * A feedback state.
   */
  feedback: PropTypes.oneOf(["success", "error"]),
  /**
   * An error message. Either an error or a helper should be used, not both.
   */
  error: PropTypes.node,
  /**
   * A detailed explanation of the input expected by a form field. Can be text,
   * other components, or HTML elements.
   *
   * If a function is provided, it must return an `InputFeedback`. The function will be
   * invoked with the following arguments.
   *
   * @param {String} feedback The input's current feedback state.
   * @param {String} value The input's current value.
   */
  helper: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  /**
   * A `Tooltip`
   */
  tooltip: componentWithName("Tooltip", true)
};
TextArea.defaultProps = {
  id: undefined,
  hint: undefined,
  value: undefined,
  feedback: undefined,
  error: undefined,
  tooltip: undefined,
  helper: undefined
};

// DO NOT MODIFY THIS FILE. IT IS COPIED DIRECTLY FROM AN NPM PACKAGE

// This was copied from the element-closest polyfill: github.com/jonathantneal/closest
// This version does not attempt to polyfill `Element` because window.Element is not available server side. This version
// is less invasive.

const matches = (element, selector) => {
  const elements = (element.document || element.ownerDocument).querySelectorAll(selector);
  let index = 0;
  while (elements[index] && elements[index] !== element) {
    index += 1;
  }
  return Boolean(elements[index]);
};
const closest = (element, selector) => {
  let currentElement = element;
  while (currentElement && currentElement.nodeType === 1) {
    if (matches(currentElement, selector)) {
      return currentElement;
    }
    currentElement = currentElement.parentNode;
  }
  return null;
};

const StyledIconButton = styled.button(noStyle);
const TooltipButton = /*#__PURE__*/React.forwardRef(({
  a11yText,
  inverted,
  onClick,
  icon: Icon
}, ref) => {
  return /*#__PURE__*/React.createElement(StyledIconButton, {
    onClick: onClick,
    ref: ref,
    type: "button"
  }, /*#__PURE__*/React.createElement(A11yContent, null, a11yText), /*#__PURE__*/React.createElement(Icon, {
    color: inverted ? "white" : "greyShark"
  }));
});
TooltipButton.displayName = "TooltipButton";
TooltipButton.propTypes = {
  a11yText: PropTypes.string.isRequired,
  inverted: PropTypes.bool,
  onClick: PropTypes.func,
  icon: componentWithName("QuestionMarkCircle").isRequired
};
TooltipButton.defaultProps = {
  inverted: false,
  onClick: undefined
};

const copyDictionary$3 = {
  en: {
    a11yTextStandalone: "Reveal additional information.",
    a11yTextLinked: "Reveal additional information for the field named '%{label}'."
  },
  fr: {
    a11yTextStandalone: "Afficher des renseignements supplémentaires.",
    a11yTextLinked: "Afficher des renseignements supplémentaires pour le champ nommé %{label}."
  }
};

const dimensions = {
  bubbleTriggerSize: "24px",
  bubbleOffset: "7px",
  bubbleTriangleHeight: "10px",
  bubbleTriangleWidth: "7px",
  bubbleTrianglePosition: "12px" // bubbleTriangleWidth + 5
};

const BubbleStyle = styled(({
  bubbleDimensions,
  direction,
  open,
  ...rest
}) => /*#__PURE__*/React.createElement(Box, rest)).attrs(({
  id
}) => ({
  "data-testid": "bubble",
  id
}))(rounded, ({
  bubbleDimensions,
  direction,
  open
}) => ({
  ...{
    display: open ? undefined : "none"
  },
  position: "absolute",
  bottom: `calc(100% + ${bubbleDimensions.bubbleTriangleHeight})`,
  backgroundColor: colorWhite,
  boxShadow: `0 0 2px 0 ${colorGreyShark}, 0 3px 2px 0 rgba(84, 89, 95, 0.25)`,
  ...{
    right: direction === "left" ? `-${bubbleDimensions.bubbleOffset}` : undefined
  },
  ...{
    left: direction === "right" ? `calc(100% - ${bubbleDimensions.bubbleTriggerSize} - ${bubbleDimensions.bubbleOffset})` : undefined
  },
  "&:before": {
    content: "",
    display: "block",
    position: "absolute",
    bottom: `-${bubbleDimensions.bubbleTriangleWidth}`,
    borderWidth: bubbleDimensions.bubbleTriangleWidth,
    borderStyle: "solid",
    borderColor: `transparent ${colorWhite} ${colorWhite} transparent`,
    backgroundColor: colorWhite,
    boxShadow: "2px 2px 3px 0 rgba(42, 42, 44, 0.4)",
    transform: "rotate(45deg)",
    ...{
      right: direction === "left" ? bubbleDimensions.bubbleTrianglePosition : undefined
    },
    ...{
      left: direction === "right" ? bubbleDimensions.bubbleTrianglePosition : undefined
    }
  },
  ...media.until("sm").css({
    maxWidth: "80vw"
  }),
  ...media.from("sm").css({
    maxWidth: "50vw"
  }),
  ...media.from("md").css({
    maxWidth: "25vw"
  })
}));
const InnerBubbleStyle = styled.div(({
  bubbleWidth
}) => ({
  ...bubbleWidth,
  maxWidth: "100%"
}));
const Bubble = ({
  id,
  direction,
  open,
  width,
  children
}) => {
  return /*#__PURE__*/React.createElement(BubbleStyle, {
    vertical: 2,
    horizontal: 3,
    bubbleDimensions: dimensions,
    direction: direction,
    open: open,
    role: "tooltip",
    "aria-live": "assertive",
    "aria-hidden": open ? "false" : "true",
    id: id
  }, /*#__PURE__*/React.createElement(InnerBubbleStyle, {
    bubbleWidth: width
  }, /*#__PURE__*/React.createElement(Text, {
    size: "small"
  }, children)));
};
Bubble.propTypes = {
  id: PropTypes.string.isRequired,
  direction: PropTypes.oneOf(["left", "right"]).isRequired,
  open: PropTypes.bool.isRequired,
  width: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired
};

const StyledTooltip = styled.div({
  ...fixLineHeight,
  position: "relative",
  width: "1rem",
  height: "1.3rem"
});
const TooltipContainer = styled.div({
  position: "absolute"
});
class T extends React.Component {
  constructor() {
    super();
    this.refTooltip = null;
  }
  state = {
    open: false,
    halfPageWidth: 0,
    tooltipPos: 0
  };
  componentDidMount() {
    this.updatePageWidth();
    this.uniqueId = this.props.tooltipId ? this.props.tooltipId : uniqueId("tooltip");
  }
  componentDidUpdate() {
    if (this.state.open) {
      document.addEventListener("click", this.toggleBubbleOnOutsideEvent);
      document.addEventListener("keypress", this.toggleBubbleOnOutsideEvent);
      window.addEventListener("resize", this.updatePageWidth);
    } else {
      document.removeEventListener("click", this.toggleBubbleOnOutsideEvent);
      document.removeEventListener("keypress", this.toggleBubbleOnOutsideEvent);
      window.removeEventListener("resize", this.updatePageWidth);
    }
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.toggleBubbleOnOutsideEvent);
    document.removeEventListener("keypress", this.toggleBubbleOnOutsideEvent);
    window.removeEventListener("resize", this.updatePageWidth);
  }
  getTriggerA11yText = (connectedFieldLabel, copy) => {
    if (copy.a11yText) {
      return getCopy(copyDictionary$3, copy).a11yText.replace("%{label}", connectedFieldLabel);
    }
    if (!connectedFieldLabel) {
      return getCopy(copyDictionary$3, copy).a11yTextStandalone;
    }
    return getCopy(copyDictionary$3, copy).a11yTextLinked.replace("%{label}", connectedFieldLabel);
  };
  getIds = connectedFieldLabel => {
    const id = generateId(connectedFieldLabel, `standalone-tooltip ${this.uniqueId}`);
    return {
      bubbleId: id.postfix("tooltip"),
      triggerId: id.postfix("trigger")
    };
  };
  setTooltipRef = element => {
    this.refTooltip = element;
  };
  toggleBubbleOnOutsideEvent = event => {
    const {
      connectedFieldLabel
    } = this.props;
    const {
      bubbleId,
      triggerId
    } = this.getIds(connectedFieldLabel);
    const inBubble = closest(event.target, `#${bubbleId}`);
    const inTrigger = closest(event.target, `#${triggerId}`);
    if (!inBubble && !inTrigger) {
      this.toggleBubble();
    }
  };
  toggleBubble = e => {
    e?.stopPropagation();
    this.updatePageWidth();
    this.setState(({
      open
    }) => {
      return {
        open: !open
      };
    });
  };
  updatePageWidth = () => {
    if (this.refTooltip) {
      this.setState({
        halfPageWidth: window.innerWidth / 2,
        tooltipPos: this.refTooltip.getBoundingClientRect().left
      });
    }
  };
  render() {
    const {
      direction,
      connectedFieldLabel,
      copy,
      children,
      forwardedRef,
      ...rest
    } = this.props;
    const {
      bubbleId,
      triggerId
    } = this.getIds(connectedFieldLabel);
    let trueDirection = null;
    if (direction === "auto") {
      trueDirection = this.state.tooltipPos > this.state.halfPageWidth ? "left" : "right";
    } else {
      trueDirection = direction;
    }
    const bubbleWidth = trueDirection === "left" ? this.state.tooltipPos : this.state.halfPageWidth * 2 - this.state.tooltipPos - 16;
    const width = {
      width: `calc(${bubbleWidth}px - 1rem - 0.5rem)`
    };
    return /*#__PURE__*/React.createElement(StyledTooltip, _extends$1({}, safeRest(rest), {
      ref: forwardedRef || this.setTooltipRef
    }), /*#__PURE__*/React.createElement(TooltipContainer, {
      "data-testid": "tooltipContainer"
    }, /*#__PURE__*/React.createElement(Bubble, {
      id: bubbleId,
      direction: trueDirection,
      open: this.state.open,
      width: width
    }, children), /*#__PURE__*/React.createElement(TooltipButton, {
      icon: QuestionMarkCircle,
      inverted: this.props.inverted,
      a11yText: this.getTriggerA11yText(this.props.connectedFieldLabel, this.props.copy),
      onClick: this.toggleBubble,
      id: triggerId,
      "aria-controls": bubbleId,
      "aria-haspopup": "true",
      "aria-expanded": this.state.open ? "true" : "false"
    })));
  }
}
const propTypes = {
  direction: PropTypes.oneOf(["left", "right", "auto"]),
  connectedFieldLabel: PropTypes.string,
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    a11yText: PropTypes.string
  })]).isRequired,
  children: PropTypes.node.isRequired,
  tooltipId: PropTypes.string,
  forwardedRef: PropTypes.object,
  inverted: PropTypes.bool
};
const defaultProps = {
  direction: "auto",
  connectedFieldLabel: undefined,
  tooltipId: undefined,
  forwardedRef: undefined,
  inverted: false
};
const RefForwardedTooltip = withForwardedRef(T);
const Tooltip = /*#__PURE__*/React.forwardRef((props, ref) => /*#__PURE__*/React.createElement(RefForwardedTooltip, _extends$1({}, props, {
  ref: ref
})));
Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;
T.propTypes = propTypes;
T.defaultProps = defaultProps;
Tooltip.displayName = "Tooltip";

const FOOTNOTE_COUNT_LIMIT = 3;
const priceValue = {
  small: {
    fontSize: "1.5rem",
    ...helveticaNeueLight45,
    letterSpacing: "-0.7px",
    ...media.from("md").css({
      fontSize: "1.75rem",
      letterSpacing: "-0.8px"
    }),
    "&& sup": {
      top: "-1em"
    }
  },
  medium: {
    fontSize: "1.75rem",
    letterSpacing: "-1.6px",
    ...helveticaNeueLight45,
    ...media.from("md").css({
      ...helveticaNeueThin35,
      fontSize: "2.75rem",
      letterSpacing: 0
    }),
    "&& sup": {
      top: "-1.5em"
    }
  },
  large: {
    fontSize: "2.75rem",
    ...helveticaNeueThin35,
    ...media.from("md").css({
      fontSize: "4.5rem",
      letterSpacing: "0.2px"
    }),
    "&& sup": {
      top: "-3em"
    }
  }
};
const hasStrikethrough = strikethroughValue => {
  if (strikethroughValue) {
    return {
      "&::before": {
        display: "block",
        width: "100%",
        content: "",
        borderBottom: `2px solid ${colorGreyRaven}`,
        position: "absolute",
        top: "50%"
      }
    };
  }
  return undefined;
};
const addStrikethroughPadding = strikethroughValue => {
  if (strikethroughValue) {
    return {
      paddingBottom: "3px"
    };
  }
  return undefined;
};
const StyledRateText = styled.span(({
  size
}) => {
  if (size === "large") {
    return large;
  }
  if (size === "medium") {
    return medium;
  }
  return {
    ...medium,
    lineHeight: 1
  };
});
const StyledPriceValue = styled.span(wordBreak, noSpacing, ({
  size,
  strikethrough
}) => {
  return {
    lineHeight: 1,
    ...priceValue[size],
    position: "relative",
    ...hasStrikethrough(strikethrough)
  };
});
const StyledDollarSign = styled.span(({
  size
}) => {
  if (size === "small") {
    return {
      medium,
      lineHeight: 1.5
    };
  }
  return large;
});
const StyledLargeDollarSign = styled.span({
  color: colorText,
  ...helveticaNeueLight45,
  fontSize: "1.75rem",
  lineHeight: "1.3",
  letterSpacing: "-1.6px",
  ...media.from("md").css({
    ...helveticaNeueThin35,
    fontSize: "2.75rem",
    letterSpacing: "0"
  })
});
const StyledWrapperAlignment = styled(Box)({
  textAlign: "left"
});
const StyledPriceWrapper = styled(Box)({
  alignItems: "flex-end",
  alignSelf: "flex-start"
});
const StyledRateTextWrapper = styled.div(({
  strikethrough
}) => {
  return {
    display: "flex",
    color: strikethrough ? colorGreyRaven : undefined,
    ...addStrikethroughPadding(strikethrough)
  };
});
const StyledFootnoteLinks = styled(StyledText)(({
  inline
}) => ({
  display: "inline-block",
  alignSelf: "flex-start",
  marginTop: !inline && "0.5rem"
}));
const StyledBottomText = styled(StyledText)({
  display: "inline-block"
});
const StrikehroughText = styled.s({
  textDecoration: "line-through"
});
const renderDollarSign = (size, a11yText) => {
  if (size === "large") {
    return /*#__PURE__*/React.createElement(StyledLargeDollarSign, {
      "aria-hidden": a11yText ? "true" : "false",
      "data-testid": "dollarSign"
    }, "$");
  }
  return /*#__PURE__*/React.createElement(StyledDollarSign, {
    "aria-hidden": a11yText ? "true" : "false",
    "data-testid": "dollarSign",
    size: size
  }, "$");
};
const renderFootnoteLinks = (footnoteLinksRef, footnoteLinks, inline) => /*#__PURE__*/React.createElement(StyledFootnoteLinks, {
  ref: footnoteLinksRef,
  inline: inline
}, footnoteLinks);
const renderBottomText = (size, bottomText, bottomTextRef) => {
  if (size !== "large" && bottomText) {
    return /*#__PURE__*/React.createElement(StyledBottomText, {
      ref: bottomTextRef,
      size: size
    }, bottomText);
  }
  if (size === "large" && bottomText) {
    warn("PriceLockup", "The props bottomText and size='large' cannot be used together");
  }
  return undefined;
};
const PriceLockup = ({
  size,
  price,
  topText,
  signDirection,
  rateText,
  bottomText,
  footnoteLinks,
  strikethrough,
  a11yText
}) => {
  const rateTextWrapperRef = React.useRef();
  const footnoteLinksRef = React.useRef();
  const containerRef = React.useRef();
  const bottomTextRef = React.useRef();
  const [footnoteLinksInline, setFootnoteLinksInline] = React.useState(true);
  const footnoteCount = React.useCallback(() => {
    let count = 0;
    if (footnoteLinks) {
      if (Array.isArray(footnoteLinks)) {
        count = footnoteLinks.reduce((acc, curr) => acc + curr.props.number.length, 0);
      } else {
        count = footnoteLinks.props.number.length;
      }
    }
    return count;
  }, [footnoteLinks]);
  const checkInline = () => {
    if (containerRef.current && footnoteLinksRef.current) {
      const footnoteLinksWidth = footnoteLinksRef.current.offsetWidth;
      const containerWidth = containerRef.current.offsetWidth;
      let textWidth;
      if (bottomText) {
        textWidth = bottomTextRef.current ? bottomTextRef.current.offsetWidth : 0;
      } else {
        textWidth = rateTextWrapperRef.current.offsetWidth;
      }
      const combinedWidth = textWidth + footnoteLinksWidth;
      setFootnoteLinksInline(combinedWidth < containerWidth && footnoteCount() <= FOOTNOTE_COUNT_LIMIT);
    }
  };
  React.useEffect(checkInline, []);
  React.useEffect(() => {
    window.addEventListener("resize", checkInline);
    return () => {
      window.removeEventListener("resize", checkInline);
    };
  });
  React.useEffect(checkInline, [footnoteLinks]);
  let wrapperSpacing;
  if (size === "small") {
    wrapperSpacing = 2;
  } else if (size === "medium") {
    wrapperSpacing = 3;
  } else {
    wrapperSpacing = {
      xs: 2,
      md: 3
    };
  }
  if (strikethrough && !a11yText) {
    warn("PriceLockup", "a11yText must be provided with strikethrough pricing");
  }
  return /*#__PURE__*/React.createElement(StyledWrapperAlignment, {
    between: wrapperSpacing
  }, /*#__PURE__*/React.createElement(Box, {
    between: size !== "large" ? 1 : undefined
  }, topText && /*#__PURE__*/React.createElement(Text, {
    size: size === "large" ? "large" : "small"
  }, topText), /*#__PURE__*/React.createElement(StyledRateTextWrapper, {
    ref: containerRef,
    strikethrough: strikethrough
  }, /*#__PURE__*/React.createElement(StyledPriceWrapper, {
    ref: rateTextWrapperRef,
    between: size === "small" ? 1 : 2,
    inline: true
  }, /*#__PURE__*/React.createElement(Box, {
    between: size === "large" ? 2 : 1,
    inline: true
  }, a11yText && /*#__PURE__*/React.createElement(A11yContent, null, a11yText), signDirection === "left" && renderDollarSign(size, a11yText), /*#__PURE__*/React.createElement(StyledPriceValue, {
    "data-testid": "priceValue",
    size: size,
    strikethrough: strikethrough,
    "aria-hidden": a11yText ? "true" : "false"
  }, strikethrough ? /*#__PURE__*/React.createElement(StrikehroughText, null, price) : /*#__PURE__*/React.createElement(React.Fragment, null, price)), signDirection === "right" && renderDollarSign(size, a11yText), !bottomText && !rateText && footnoteLinksInline && /*#__PURE__*/React.createElement(React.Fragment, null, strikethrough && /*#__PURE__*/React.createElement(A11yContent, null, a11yText), /*#__PURE__*/React.createElement(StyledPriceValue, {
    "data-testid": "priceValue",
    size: size,
    strikethrough: strikethrough
  }, renderFootnoteLinks(footnoteLinksRef, footnoteLinks, footnoteLinksInline)))), rateText && /*#__PURE__*/React.createElement(StyledRateText, {
    "aria-hidden": a11yText ? "true" : "false",
    "data-testid": "rateText",
    size: size
  }, rateText, !bottomText && footnoteLinksInline && renderFootnoteLinks(footnoteLinksRef, footnoteLinks, footnoteLinksInline))))), (size !== "large" && bottomText || footnoteLinks && !footnoteLinksInline) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HairlineDivider, null), /*#__PURE__*/React.createElement("span", null, renderBottomText(size, bottomText, bottomTextRef), renderFootnoteLinks(footnoteLinksRef, footnoteLinks, footnoteLinksInline))));
};
PriceLockup.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]).isRequired,
  signDirection: PropTypes.oneOf(["left", "right"]),
  topText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  bottomText: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  rateText: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  footnoteLinks: componentWithName("FootnoteLink"),
  strikethrough: PropTypes.bool,
  a11yText: PropTypes.string
};
PriceLockup.defaultProps = {
  signDirection: "left",
  topText: undefined,
  bottomText: undefined,
  rateText: undefined,
  footnoteLinks: undefined,
  strikethrough: false,
  a11yText: undefined
};

const StyledClickable = styled.button(noStyle, {
  display: "flex"
});

const StyledListItem = styled.li({
  "& > span": {
    ...smallFont
  },
  paddingLeft: "1rem"
});
const StyledList = styled(Box)({
  ...boldFont,
  ...sizeSmall,
  paddingLeft: "2rem",
  ...media.from("md").css({
    paddingLeft: "1rem"
  })
}, ({
  type
}) => ({
  listStyle: type === "indexed" ? "decimal" : "none"
}));
const Item = ({
  styledComponent: Component,
  ...rest
}) => /*#__PURE__*/React.createElement(Component, rest);
Item.propTypes = {
  styledComponent: PropTypes.object
};
Item.defaultProps = {
  styledComponent: StyledListItem
};
const List = ({
  children,
  styledComponent: Component,
  type,
  ...rest
}) => {
  return /*#__PURE__*/React.createElement(Component, _extends$1({}, rest, {
    tag: type === "indexed" ? "ol" : "ul",
    between: 3,
    type: type
  }), React.Children.toArray(children).filter(child => child).map(child => /*#__PURE__*/React.cloneElement(child)));
};
List.propTypes = {
  type: PropTypes.oneOf(["indexed", "nonIndexed"]).isRequired,
  children: PropTypes.node.isRequired,
  styledComponent: PropTypes.object
};
List.defaultProps = {
  styledComponent: StyledList
};
List.Item = Item;

const StyledFootnoteListItem = styled(StyledListItem)({
  "& > span": {
    ...mediumFont
  },
  ...media.from("md").css({
    paddingLeft: "2rem"
  })
});
const StyledFootnoteList = styled(StyledList)({
  ...sizeMedium,
  marginLeft: "1rem",
  ...media.from("md").css({
    marginLeft: 0
  })
});
const FootnoteList = withStyledComponent(StyledFootnoteList)(List);
const FootnoteListItem = withStyledComponent(StyledFootnoteListItem)(List.Item);
FootnoteList.Item = FootnoteListItem;

const Close = () => /*#__PURE__*/React.createElement("svg", {
  width: "24px",
  height: "24px",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink",
  style: {
    background: colorGreyAthens
  },
  focusable: "false"
}, /*#__PURE__*/React.createElement("g", {
  stroke: "none",
  strokeWidth: "1",
  fill: "none",
  fillRule: "evenodd"
}, /*#__PURE__*/React.createElement("g", {
  fill: "#4B286D",
  fillRule: "nonzero"
}, /*#__PURE__*/React.createElement("path", {
  d: "M11.99975,12.70675 L7.85325,16.85325 C7.75625,16.95025 7.62825,16.99925 7.50025,16.99925 C7.37225,16.99925 7.24425,16.95025 7.14625,16.85325 C6.95125,16.65825 6.95125,16.34125 7.14625,16.14625 L11.29275,11.99975 L7.14625,7.85325 C6.95125,7.65825 6.95125,7.34125 7.14625,7.14625 C7.34125,6.95125 7.65825,6.95125 7.85325,7.14625 L11.99975,11.29275 L16.14625,7.14625 C16.34125,6.95125 16.65825,6.95125 16.85325,7.14625 C17.04825,7.34125 17.04825,7.65825 16.85325,7.85325 L12.70675,11.99975 L16.85325,16.14625 C17.04825,16.34125 17.04825,16.65825 16.85325,16.85325 C16.75625,16.95025 16.62825,16.99925 16.50025,16.99925 C16.37225,16.99925 16.24425,16.95025 16.14625,16.85325 L11.99975,12.70675 Z M12,24 C5.38330435,24 0,18.6166957 0,12 C0,5.38330435 5.38330435,0 12,0 C18.6166957,0 24,5.38330435 24,12 C24,18.6166957 18.6166957,24 12,24 Z M12,1.04347826 C5.95826087,1.04347826 1.04347826,5.95826087 1.04347826,12 C1.04347826,18.0417391 5.95826087,22.9565217 12,22.9565217 C18.0417391,22.9565217 22.9565217,18.0417391 22.9565217,12 C22.9565217,5.95826087 18.0417391,1.04347826 12,1.04347826 Z"
}))));

const copyDictionary$2 = {
  en: {
    heading: "Terms and conditions",
    close: "close"
  },
  fr: {
    heading: "Modalités et conditions",
    close: "fermer"
  }
};

const generateLinks = content => {
  const linkRegex = /<\s*a([^>]*)>(.*?)<\s*\/\s*a>/g;
  const attributeRegex = /(\w+)\s*=\s*((["'])(.*?)\3|(?=\s|\/>))/g;
  const parts = content.split(linkRegex);
  if (parts.length === 1) {
    return parts;
  }
  // start with first anchor text, attributes will be in the previous part
  for (let i = 2; i < parts.length; i += 3) {
    const o = {};
    // get attributes from previous part
    const attributes = parts[i - 1].trim();

    // create object from attributes
    const matchedAttributes = attributes.match(attributeRegex);
    if (matchedAttributes) {
      matchedAttributes.forEach(attribute => {
        const split = attribute.split("=");
        o[split[0]] = split[1].substr(1, split[1].length - 2);
      });
    }
    // remove anchor attributes from parts
    parts[i - 1] = undefined;
    // replace anchor text with Link in parts
    parts[i] = /*#__PURE__*/React.createElement(Link$1, _extends$1({}, o, {
      key: i
    }), parts[i]);
  }
  return parts;
};
const generateBreaks = parts => {
  const breakRegex = /<br\s?\/*>/g;
  const partsWithBreaks = parts;
  for (let i = 0; i < partsWithBreaks.length; i += 1) {
    if (typeof partsWithBreaks[i] === "string" && partsWithBreaks[i].search(breakRegex) !== -1) {
      const toSplit = partsWithBreaks[i].split(breakRegex);
      for (let x = 1; x < toSplit.length; x += 2) {
        toSplit.splice(x, 0, /*#__PURE__*/React.createElement("br", {
          key: `break-${i}-${x}`
        }));
      }
      partsWithBreaks[i] = toSplit;
    }
  }
  return partsWithBreaks;
};
const renderContent = content => {
  if (typeof content !== "string") {
    return content;
  }
  return generateBreaks(generateLinks(content));
};

const GlobalBodyScrollLock = styled.createGlobalStyle({
  "html, body": media.until("md").css({
    overflow: "hidden"
  })
});
const StyledFootnote = styled.div({
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
    transition: "none"
  },
  zIndex: 99999,
  ...media.from("md").css({
    top: "auto",
    bottom: 0,
    height: "auto",
    maxHeight: "50vh"
  })
}, ({
  isVisible
}) => ({
  visibility: isVisible ? "visible" : "hidden"
}), ({
  isOpen
}) => {
  if (isOpen) {
    return {
      transform: "translateY(0)"
    };
  }
  return {};
});
const StyledFootnoteHeader = styled.div({
  position: "relative",
  width: "100%"
});
const StyledHeader = styled(Box)({
  alignItems: "center"
});
const StyledFootnoteBody = styled.div({
  overflow: "auto",
  "-webkit-overflow-scrolling": "touch",
  transition: "height 300ms ease-out, opacity 200ms ease-out",
  transform: "translateZ(0)",
  "@media (prefers-reduced-motion: reduce)": {
    transition: "height 1ms ease-out, opacity 1ms ease-out"
  },
  backgroundColor: colorGreyAthens
}, ({
  headerHeight
}) => ({
  maxHeight: `calc(100vh - ${headerHeight}px)`,
  ...media.from("md").css({
    maxHeight: `calc(50vh - ${headerHeight}px)`
  })
}), ({
  bodyHeight,
  isTextVisible
}) => ({
  height: bodyHeight,
  opacity: isTextVisible ? 1 : 0
}));
const StyledListContainer = styled.div({
  paddingTop: "1.5rem",
  paddingBottom: "2rem",
  ...media.from("md").css({
    paddingTop: "0rem",
    paddingBottom: "3rem"
  })
});
const FocusTrap = withFocusTrap("div");
const usePrevious = value => {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  if (ref.current) {
    return ref.current;
  }
  return {};
};
const Footnote = props => {
  const {
    copy,
    number,
    content,
    onClose,
    isOpen,
    ...rest
  } = props;
  const footnoteRef = React.useRef(null);
  const headerRef = React.useRef(null);
  const bodyRef = React.useRef(null);
  const listRef = React.useRef(null);
  const headingRef = React.useRef(null);
  const [data, setData] = React.useState({
    content: null,
    number: null
  });
  const [headerHeight, setHeaderHeight] = React.useState("auto");
  const [bodyHeight, setBodyHeight] = React.useState("auto");
  const [isVisible, setIsVisible] = React.useState(false);
  const [isTextVisible, setIsTextVisible] = React.useState(true);
  const prevProps = usePrevious(props);
  const closeFootnote = React.useCallback((e, options) => {
    onClose(e, options);
  }, [onClose]);

  // listen for ESCAPE, close button clicks, and clicks outside of the Footnote. Call onClose.
  const handleClose = React.useCallback(e => {
    if (e.type === "keydown") {
      const key = e.keyCode || e.key;
      if (key === "Escape" || key === 27) {
        closeFootnote(e, {
          returnFocus: true
        });
      }
    } else if (e.type === "click" && footnoteRef && e.target && !footnoteRef.current.contains(e.target) && e.target.getAttribute("data-tds-id") !== "footnote-link") {
      closeFootnote(e, {
        returnFocus: false
      });
    } else if (e.type === "touchstart" && footnoteRef && e.touches[0].target && !footnoteRef.current.contains(e.touches[0].target) && e.touches[0].target.getAttribute("data-tds-id") !== "footnote-link") {
      closeFootnote(e, {
        returnFocus: false
      });
    }
  }, [closeFootnote]);
  const saveCurrentHeight = () => {
    const oldHeight = listRef.current.offsetHeight;
    setBodyHeight(oldHeight);
  };
  const focusHeading = () => {
    if (content !== null && isVisible && headingRef && headingRef.current !== null) {
      headingRef.current.focus();
    }
  };
  const handleStyledFootnoteTransitionEnd = e => {
    if (e.propertyName === "transform" && !isOpen) {
      setIsVisible(false);
    } else {
      focusHeading();
    }
  };
  const handleTransitionEnd = e => {
    e.persist();
    if (e.propertyName === "opacity" && !isTextVisible) {
      setData({
        content,
        number
      });
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
  React.useEffect(() => {
    setHeaderHeight(headerRef.current.offsetHeight);
  }, []);
  const preventDefault = e => {
    if (!bodyRef.current.contains(e.touches[0].target)) {
      e.preventDefault();
    }
  };

  // add listeners for mouse clicks outside of Footnote and for ESCAPE key presses
  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      window.addEventListener("click", handleClose);
      window.addEventListener("keydown", handleClose);
      window.addEventListener("touchstart", handleClose);
      window.addEventListener("touchmove", preventDefault, {
        passive: false
      });
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
  React.useEffect(() => {
    if (isOpen && !prevProps.isOpen) {
      setData({
        content,
        number
      });
    }
  }, [isOpen, prevProps.isOpen, content, number]);
  React.useEffect(() => {
    if (isOpen && prevProps.isOpen && number !== prevProps.number) {
      saveCurrentHeight();
      setIsTextVisible(false);
    }
  }, [number, isOpen, prevProps.isOpen, prevProps.number]);
  // reset footnote on close
  React.useEffect(resetFootnote, [isOpen]);
  return /*#__PURE__*/React.createElement("div", safeRest(rest), isOpen && /*#__PURE__*/React.createElement(GlobalBodyScrollLock, null), /*#__PURE__*/React.createElement(StyledFootnote, {
    ref: footnoteRef,
    isOpen: isOpen,
    isVisible: isVisible,
    onTransitionEnd: handleStyledFootnoteTransitionEnd
  }, /*#__PURE__*/React.createElement(FocusTrap, {
    autofocus: false
  }, /*#__PURE__*/React.createElement(StyledFootnoteHeader, {
    ref: headerRef
  }, /*#__PURE__*/React.createElement("div", {
    css: {
      display: "none",
      ...media.from("md").css({
        display: "block"
      })
    }
  }, /*#__PURE__*/React.createElement(HairlineDivider, null)), /*#__PURE__*/React.createElement(Box, {
    vertical: 4
  }, /*#__PURE__*/React.createElement(FlexGrid, null, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, {
    xs: 12
  }, /*#__PURE__*/React.createElement(StyledHeader, {
    between: "space-between",
    inline: true
  }, /*#__PURE__*/React.createElement(Heading, {
    level: "h4",
    tag: "h2",
    tabIndex: -1,
    ref: headingRef
  }, getCopy(copyDictionary$2, copy).heading), /*#__PURE__*/React.createElement(StyledClickable, {
    type: "button",
    onClick: e => {
      closeFootnote(e, {
        returnFocus: true
      });
    },
    "aria-label": getCopy(copyDictionary$2, copy).close
  }, /*#__PURE__*/React.createElement(Close, null))))))), /*#__PURE__*/React.createElement("div", {
    css: {
      display: "none",
      ...media.until("md").css({
        display: "block"
      })
    }
  }, /*#__PURE__*/React.createElement(HairlineDivider, null))), /*#__PURE__*/React.createElement(StyledFootnoteBody, {
    ref: bodyRef,
    bodyHeight: bodyHeight,
    headerHeight: headerHeight,
    isTextVisible: isTextVisible,
    onTransitionEnd: handleTransitionEnd
  }, data.number && data.content && /*#__PURE__*/React.createElement(StyledListContainer, {
    ref: listRef
  }, /*#__PURE__*/React.createElement(FlexGrid, null, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, {
    xs: 12,
    md: 11
  }, /*#__PURE__*/React.createElement(FootnoteList, {
    start: data.number,
    type: "indexed"
  }, /*#__PURE__*/React.createElement(FootnoteList.Item, null, /*#__PURE__*/React.createElement(Text, null, renderContent(data.content))))))))))));
};
const copyShape$1 = PropTypes.shape({
  heading: PropTypes.string.isRequired,
  close: PropTypes.string.isRequired
});
Footnote.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), copyShape$1]).isRequired,
  number: PropTypes.number,
  content: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool
};
Footnote.defaultProps = {
  isOpen: false,
  number: undefined,
  content: undefined
};

const copyDictionary$1 = {
  en: {
    a11yLabel: "Read legal footnote"
  },
  fr: {
    a11yLabel: "Lire la note de bas de page légale"
  }
};

const StyledFootnoteLink = styled.button({
  backgroundColor: "transparent",
  border: 0,
  textDecoration: "underline",
  padding: "0 0.25rem",
  color: "inherit",
  cursor: "pointer"
});
const FootnoteLink = ({
  number,
  onClick,
  copy
}) => {
  let numbers = [];
  if (!Array.isArray(number)) {
    numbers[0] = number;
  } else {
    numbers = number;
  }
  const refs = numbers.map(() => /*#__PURE__*/React.createRef());
  const handleClick = index => {
    onClick(numbers[index], refs[index]);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, numbers.map((n, i) => /*#__PURE__*/React.createElement("sup", {
    key: n
  }, /*#__PURE__*/React.createElement(StyledFootnoteLink, {
    type: "button",
    key: numbers[i],
    ref: refs[i],
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      handleClick(i);
    },
    "data-tds-id": "footnote-link",
    "data-nosnippet": true
  }, /*#__PURE__*/React.createElement(A11yContent, {
    role: "doc-noteref"
  }, getCopy(copyDictionary$1, copy).a11yLabel), `${numbers[i]}${i !== numbers.length - 1 ? "," : ""}`))));
};
FootnoteLink.displayName = "FootnoteLink";
const copyShape = PropTypes.shape({
  a11yLabel: PropTypes.string.isRequired
});
FootnoteLink.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), copyShape]).isRequired,
  number: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]).isRequired,
  onClick: PropTypes.func.isRequired
};

const StyledDisclaimer = styled(StyledParagraph)({
  color: colorShuttleGrey
});
const Disclaimer = ({
  children,
  ...props
}) => {
  return /*#__PURE__*/React.createElement(StyledDisclaimer, _extends$1({}, safeRest(props), {
    size: "small"
  }), /*#__PURE__*/React.createElement(ColoredTextProvider, null, children));
};
Disclaimer.propTypes = {
  children: PropTypes.node.isRequired
};

const StyledChevron = styled.span(({
  isOpen
}) => ({
  lineHeight: "24px",
  position: "absolute",
  top: 0,
  left: 0,
  transition: "transform 300ms",
  transform: `translate(6px, ${isOpen ? "-2px" : "-1px"})`,
  [`${StyledClickable}:hover &`]: {
    transform: `translate(6px, ${!isOpen ? "2px" : "-5px"})`
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none"
  }
}));
const Chevron = ({
  isOpen
}) => /*#__PURE__*/React.createElement(StyledChevron, {
  isOpen: isOpen
}, /*#__PURE__*/React.createElement("svg", {
  width: "12px",
  height: "8px",
  viewBox: "0 0 12 8",
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink"
}, /*#__PURE__*/React.createElement("path", {
  d: "M11.7940812,0.183230226 C11.4424627,-0.117489399 11.0896181,0.0450442657 10.8868854,0.245275736 L5.99681615,4.74055299 L1.11722187,0.245275732 C0.93839231,0.0814520871 0.490533284,-0.180032793 0.165240429,0.183230232 C-0.160052425,0.546493257 0.0652096387,0.91610528 0.243271687,1.07992892 L5.6348225,6.87660266 C5.81365205,7.04113245 6.10607292,7.04113245 6.28490248,6.87660266 C6.28490248,6.87589653 11.7940809,1.07992896 11.7940809,1.07992896 C11.9792355,0.935042671 12.1456996,0.483949851 11.7940812,0.183230226 Z",
  transform: isOpen ? "rotate(180, 6, 4)" : undefined
})));
Chevron.propTypes = {
  isOpen: PropTypes.bool
};
Chevron.defaultProps = {
  isOpen: false
};

const Circle = () => /*#__PURE__*/React.createElement("svg", {
  width: "24px",
  height: "24px",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  xmlnsXlink: "http://www.w3.org/1999/xlink"
}, /*#__PURE__*/React.createElement("path", {
  d: "M12,0 C5.373,0 0,5.373 0,12 C0,18.627 5.373,24 12,24 C18.627,24 24,18.627 24,12 C24,5.373 18.627,0 12,0 M12,1 C18.065,1 23,5.935 23,12 C23,18.065 18.065,23 12,23 C5.935,23 1,18.065 1,12 C1,5.935 5.935,1 12,1",
  fill: colorNemetonPurple
}));

const copyDictionary = {
  en: {
    headingView: "View terms and conditions",
    headingHide: "Hide terms and conditions",
    nonIndexedTitle: "The following applies to all terms and conditions above"
  },
  fr: {
    headingView: "Voir les modalités et conditions",
    headingHide: "Masquer les modalités et conditions",
    nonIndexedTitle: "Ce qui suit s’applique aux modalités et conditions ci-dessus"
  }
};

const StyledClickableHeading = styled(StyledClickable)({
  width: "100%",
  justifyContent: "center",
  backgroundColor: colorWhite
});
const StyledExpandCollapseHeading = styled(Box)({
  alignItems: "center"
});
const StyledChevronContainer = styled.span({
  position: "relative",
  width: "24px",
  height: "24px"
});
const UPPER_SPEED_LIMIT = 150;
const LOWER_SPEED_LIMIT = 600;
const calculateSpeed = (height, isExpanding) => {
  const h = height * 0.5;
  if (h < UPPER_SPEED_LIMIT) {
    return UPPER_SPEED_LIMIT;
  }
  if (h > LOWER_SPEED_LIMIT) {
    return LOWER_SPEED_LIMIT;
  }
  return isExpanding ? h + h * 0.2 : h;
};
const TermsAndConditions = /*#__PURE__*/React.forwardRef(({
  copy,
  indexedContent,
  nonIndexedContent,
  ...rest
}, ref) => {
  const contentWrapper = React.useRef(null);
  const [isOpen, setOpen] = React.useState(false);
  const [contentWrapperHeight, setContentWrapperHeight] = React.useState(0);
  const speed = calculateSpeed(contentWrapperHeight, isOpen);
  const hasIndexedContent = indexedContent.length > 0;
  const hasNonIndexedContent = nonIndexedContent.length > 0;
  React.useEffect(() => {
    if (contentWrapper.current.offsetHeight !== contentWrapperHeight) {
      setContentWrapperHeight(() => {
        return contentWrapper.current.offsetHeight;
      });
    }
  }, [contentWrapperHeight]);
  return /*#__PURE__*/React.createElement("div", safeRest(rest), /*#__PURE__*/React.createElement(HairlineDivider, null), /*#__PURE__*/React.createElement(FlexGrid, {
    gutter: false,
    limitWidth: false
  }, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, null, /*#__PURE__*/React.createElement(StyledClickableHeading, {
    type: "button",
    "aria-expanded": isOpen,
    ref: ref,
    onClick: () => setOpen(!isOpen)
  }, /*#__PURE__*/React.createElement(StyledExpandCollapseHeading, {
    inline: true,
    vertical: 3,
    between: 3
  }, /*#__PURE__*/React.createElement(StyledChevronContainer, null, /*#__PURE__*/React.createElement(Circle, null), /*#__PURE__*/React.createElement(Chevron, {
    isOpen: isOpen
  })), /*#__PURE__*/React.createElement(Heading, {
    level: "h4",
    tag: "h2"
  }, !isOpen ? getCopy(copyDictionary, copy).headingView : getCopy(copyDictionary, copy).headingHide)))))), /*#__PURE__*/React.createElement(FadeAndReveal, {
    timeout: speed,
    in: isOpen,
    height: contentWrapperHeight
  }, () => /*#__PURE__*/React.createElement("div", {
    ref: contentWrapper
  }, /*#__PURE__*/React.createElement(FlexGrid, {
    gutter: false,
    limitWidth: false
  }, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, null, /*#__PURE__*/React.createElement(DimpleDivider, null)))), /*#__PURE__*/React.createElement(Translate, {
    timeout: speed,
    in: isOpen,
    direction: "y",
    distance: isOpen ? "0rem" : "1rem",
    initialStyle: {
      transform: "translateY(1rem)"
    }
  }, () => /*#__PURE__*/React.createElement(React.Fragment, null, hasIndexedContent > 0 && /*#__PURE__*/React.createElement(FlexGrid, null, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, {
    xs: 12,
    mdOffset: 1,
    md: 10
  }, /*#__PURE__*/React.createElement(List, {
    size: "small",
    below: 4,
    type: "indexed"
  }, indexedContent.map((c, idx) =>
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  React.createElement(List.Item, {
    key: idx
  }, renderContent(c))))))), hasNonIndexedContent && /*#__PURE__*/React.createElement(FlexGrid, null, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, {
    xs: 12,
    mdOffset: 1,
    md: 10
  }, /*#__PURE__*/React.createElement(Box, {
    between: 3
  }, hasIndexedContent && /*#__PURE__*/React.createElement("div", {
    css: {
      paddingLeft: "2rem"
    }
  }, /*#__PURE__*/React.createElement(Heading, {
    level: "h4",
    tag: "span"
  }, getCopy(copyDictionary, copy).nonIndexedTitle)), /*#__PURE__*/React.createElement(List, {
    size: "small",
    below: 4,
    type: "nonIndexed"
  }, nonIndexedContent.map((c, idx) =>
  /*#__PURE__*/
  // eslint-disable-next-line react/no-array-index-key
  React.createElement(List.Item, {
    key: idx
  }, renderContent(c)))))))))))), /*#__PURE__*/React.createElement(HairlineDivider, null));
});
TermsAndConditions.displayName = "TermsAndConditions";
TermsAndConditions.propTypes = {
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    headingView: PropTypes.string,
    headingHide: PropTypes.string,
    nonIndexedTitle: PropTypes.string
  })]).isRequired,
  indexedContent: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.node, PropTypes.string])),
  nonIndexedContent: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.node, PropTypes.string]))
};
TermsAndConditions.defaultProps = {
  indexedContent: [],
  nonIndexedContent: []
};

const stepTrackerText = {
  en: {
    mobileStepLabel: "Step %{current} of %{total}:"
  },
  fr: {
    mobileStepLabel: "Étape %{current} sur %{total}:"
  }
};

const StyledStep = styled.div({
  position: "relative",
  textAlign: "center",
  width: "100%",
  "&:before, &:after": {
    position: "absolute",
    top: "17px",
    width: "calc(50% - 1.07rem)",
    content: "",
    borderBottom: `0.1rem solid ${colorGreyShuttle}`
  },
  "&:before": {
    left: 0
  },
  "&:after": {
    right: 0
  },
  "&:first-child": {
    "&:before": {
      content: "none"
    }
  },
  "&:last-child": {
    "&:after": {
      content: "none"
    }
  }
});
const StyledIcon = styled.span(({
  isStepActive
}) => ({
  display: "inline-block",
  border: `0.1rem solid ${colorGreyShuttle}`,
  borderRadius: "50%",
  lineHeight: "1.7rem",
  width: "35px",
  height: "35px",
  marginBottom: "1rem",
  ...(isStepActive && {
    backgroundColor: colorPrimary,
    textAlign: "center",
    border: `0.1rem solid ${colorPrimary}`
  })
}));
const StyledLabel = styled.div({
  display: "none",
  textAlign: "center",
  ...media.from("md").css({
    display: "block"
  })
});
const Step = ({
  label,
  status,
  stepNumber,
  stepIndex
}) => {
  const isStepActive = () => {
    return status > stepIndex || status === stepIndex;
  };
  return /*#__PURE__*/React.createElement(StyledStep, {
    "aria-label": label,
    "aria-current": status === stepIndex ? "true" : "false",
    "data-testid": `singleStepContainer-${stepIndex}`,
    "data-isactive": isStepActive()
  }, /*#__PURE__*/React.createElement(StyledIcon, {
    isStepActive: isStepActive()
  }, status > stepIndex ? /*#__PURE__*/React.createElement(DecorativeIcon, {
    symbol: "checkmark",
    size: 16,
    variant: "inverted"
  }) : /*#__PURE__*/React.createElement("br", null)), /*#__PURE__*/React.createElement(StyledLabel, null, /*#__PURE__*/React.createElement(Text, {
    bold: status === stepIndex
  }, stepNumber, ". ", label)));
};
Step.propTypes = {
  label: PropTypes.string.isRequired,
  status: PropTypes.number.isRequired,
  stepNumber: PropTypes.number.isRequired,
  stepIndex: PropTypes.number.isRequired
};

const StyledStepBg = styled.div({
  padding: "1rem 0",
  backgroundColor: colorWhite
});
const StyledStepContainer = styled.div({
  display: "flex",
  flexDirection: "row"
});
const StyledMobileLabel = styled.div({
  width: "100%",
  textAlign: "center"
});
const parseStepText = (current, steps, mobileStepLabelTemplate) => {
  return /*#__PURE__*/React.createElement("span", null, mobileStepLabelTemplate.replace("%{current}", current < steps.length ? current + 1 : steps.length).replace("%{total}", steps.length));
};
const getStepLabel = (current, steps) => {
  return current < steps.length ? steps[current] : steps[steps.length - 1];
};
const StepTracker = ({
  current,
  steps,
  copy,
  mobileStepLabelTemplate,
  ...rest
}) => {
  if (mobileStepLabelTemplate && copy === undefined) {
    deprecate("core-step-tracker", "The `mobileStepLabelTemplate` prop, along with its default copy, is deprecated. Please use the `copy` prop. The `copy` prop will be required in the next major release.");
  }
  const stepText = parseStepText(current, steps, getCopy(stepTrackerText, copy).mobileStepLabel || mobileStepLabelTemplate);
  const stepLabel = getStepLabel(current, steps);
  return /*#__PURE__*/React.createElement(StyledStepBg, _extends$1({}, safeRest(rest), {
    "data-testid": "stepTrackerContainer"
  }), /*#__PURE__*/React.createElement(FlexGrid, null, /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, {
    xs: 12
  }, /*#__PURE__*/React.createElement(StyledStepContainer, null, steps.map((label, index) => {
    return /*#__PURE__*/React.createElement(Step, {
      status: current,
      label: label,
      stepNumber: index + 1,
      stepIndex: index,
      key: label,
      "data-testid": `step-${index}`
    });
  })))), /*#__PURE__*/React.createElement(FlexGrid.Row, null, /*#__PURE__*/React.createElement(FlexGrid.Col, {
    xs: 12,
    md: 0
  }, /*#__PURE__*/React.createElement(StyledMobileLabel, null, /*#__PURE__*/React.createElement(Text, {
    "data-testid": "mobileStepLabel"
  }, stepText, " ", stepLabel))))));
};
StepTracker.propTypes = {
  current: PropTypes.number.isRequired,
  steps: PropTypes.array.isRequired,
  copy: PropTypes.oneOfType([PropTypes.oneOf(["en", "fr"]), PropTypes.shape({
    mobileStepLabel: PropTypes.string
  })]),
  mobileStepLabelTemplate: PropTypes.string
};
StepTracker.defaultProps = {
  copy: undefined,
  mobileStepLabelTemplate: "Step %{current} of %{total}:"
};

exports.A11yContent = A11yContent;
exports.Accordion = Accordion;
exports.BenefitNoHeading = BenefitNoHeading;
exports.BenefitWithHeading = BenefitWithHeading;
exports.Box = Box;
exports.Button = Button;
exports.ButtonGroup = ButtonGroup;
exports.ButtonLink = ButtonLink;
exports.Card = Card;
exports.Checkbox = Checkbox;
exports.ChevronLink = ChevronLink;
exports.Col = Col;
exports.Colours = colours;
exports.DecorativeIcon = DecorativeIcon;
exports.DimpleDivider = DimpleDivider;
exports.Disclaimer = Disclaimer;
exports.DisplayHeading = DisplayHeading;
exports.ExpandCollapse = ExpandCollapse;
exports.FeedbackIcon = FeedbackIcon;
exports.FlexGrid = FlexGrid;
exports.Footnote = Footnote;
exports.FootnoteLink = FootnoteLink;
exports.HairlineDivider = HairlineDivider;
exports.Heading = Heading;
exports.Input = Input;
exports.InputFeedback = InputFeedback;
exports.Link = Link$1;
exports.Login = Login;
exports.Notification = Notification;
exports.OrderedList = OrderedList;
exports.Paragraph = Paragraph;
exports.PriceLockup = PriceLockup;
exports.Radio = Radio;
exports.Responsive = Responsive;
exports.Row = Row;
exports.SVGs = index;
exports.Select = Select;
exports.Spinner = Spinner;
exports.StepTracker = StepTracker;
exports.StyledCol = StyledCol;
exports.StyledOrderedItem = StyledOrderedItem;
exports.StyledRow = StyledRow;
exports.TermsAndConditions = TermsAndConditions;
exports.Text = Text;
exports.TextArea = TextArea;
exports.TextButton = TextButton;
exports.Tooltip = Tooltip;
exports.media = media;