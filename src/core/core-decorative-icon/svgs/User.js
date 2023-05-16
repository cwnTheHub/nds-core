import React from "react";
import SVGIcon from "../SVGIcon";

const User = (props) => {
  return (
    <SVGIcon {...props}>
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12,0 C5.383,0 0,5.383 0,12 C0,18.617 5.383,24 12,24 C18.617,24 24,18.617 24,12 C24,5.383 18.617,0 12,0 Z M12,23 C9.616,23 7.413,22.229 5.609,20.935 L8.193,20.073 C9.757,19.421 10.278,17.073 10.278,16.5 C10.278,16.35 10.211,16.209 10.096,16.114 C9.537,15.653 8.944,14.853 8.944,14.278 C8.944,13.605 8.669,13.223 8.401,13.036 C8.276,12.69 8.074,12.06 8.057,11.663 C8.306,11.635 8.5,11.423 8.5,11.166 L8.5,8.499 C8.5,7.072 9.863,4.999 12,4.999 C14.008,4.999 14.537,5.864 14.604,6.206 C14.586,6.27 14.579,6.333 14.585,6.389 C14.614,6.66 14.817,6.789 14.926,6.858 C15.098,6.967 15.5,7.223 15.5,8.5 L15.5,11.167 C15.5,11.444 15.634,11.636 15.91,11.636 C15.919,11.645 15.931,11.667 15.942,11.689 C15.918,12.088 15.724,12.692 15.599,13.036 C15.332,13.223 15.056,13.605 15.056,14.278 C15.056,14.853 14.463,15.653 13.904,16.114 C13.788,16.209 13.722,16.351 13.722,16.5 C13.722,17.072 14.244,19.421 15.842,20.085 L18.391,20.935 C16.588,22.229 14.384,23 12,23 Z M19.137,20.354 C19.091,20.206 18.985,20.079 18.827,20.026 L16.195,19.15 C15.275,18.767 14.848,17.295 14.748,16.706 C15.429,16.073 16.058,15.13 16.058,14.278 C16.058,13.989 16.14,13.877 16.124,13.874 C16.28,13.835 16.407,13.724 16.467,13.575 C16.516,13.452 16.947,12.353 16.947,11.612 C16.947,11.572 16.942,11.531 16.932,11.491 C16.869,11.24 16.722,10.987 16.502,10.829 L16.502,8.501 C16.502,7.061 16.063,6.459 15.6,6.11 C15.496,5.395 14.73,4.001 12.002,4.001 C9.214,4.001 7.502,6.622 7.502,8.501 L7.502,10.829 C7.282,10.987 7.135,11.24 7.072,11.491 C7.062,11.53 7.057,11.571 7.057,11.612 C7.057,12.353 7.488,13.452 7.537,13.575 C7.597,13.724 7.676,13.819 7.832,13.858 C7.864,13.877 7.946,13.988 7.946,14.278 C7.946,15.13 8.575,16.073 9.256,16.706 C9.156,17.295 8.733,18.765 7.843,19.137 L5.176,20.026 C5.017,20.079 4.911,20.207 4.865,20.356 C2.504,18.336 1,15.343 1,12 C1,5.935 5.935,1 12,1 C18.065,1 23,5.935 23,12 C23,15.341 21.497,18.334 19.137,20.354 Z"
        />
      </svg>
    </SVGIcon>
  );
};

User.displayName = "DecorativeIcon";

export default User;
