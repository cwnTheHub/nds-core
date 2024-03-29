import React from "react";
import SVGIcon from "../SVGIcon";

const UsbCable = (props) => (
  <SVGIcon {...props}>
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M5.5,2 L3.5,2 C3.224,2 3,2.224 3,2.5 L3,4.5 C3,4.776 3.224,5 3.5,5 L5.5,5 C5.776,5 6,4.776 6,4.5 L6,2.5 C6,2.224 5.776,2 5.5,2 Z M5,4 L4,4 L4,3 L5,3 L5,4 Z M19.5,0 C17.019,0 15,2.019 15,4.5 L15,19 C15,21.206 13.206,23 11,23 C8.794,23 7,21.206 7,19 L7,18.975 C10.351,18.718 13,15.916 13,12.5 L13,9.5 C13,8.849 12.581,8.299 12,8.092 L12,0.5 C12,0.224 11.776,0 11.5,0 L1.5,0 C1.224,0 1,0.224 1,0.5 L1,8.092 C0.419,8.299 0,8.849 0,9.5 L0,12.5 C0,15.915 2.649,18.718 6,18.975 L6,19 C6,21.757 8.243,24 11,24 C13.757,24 16,21.757 16,19 L16,4.5 C16,2.57 17.57,1 19.5,1 C21.43,1 23,2.57 23,4.5 L23,8.5 C23,8.776 23.224,9 23.5,9 C23.776,9 24,8.776 24,8.5 L24,4.5 C24,2.019 21.981,0 19.5,0 Z M2,1 L11,1 L11,8 L2,8 L2,1 Z M1,12.5 L1,9.5 C1,9.224 1.224,9 1.5,9 L11.5,9 C11.776,9 12,9.224 12,9.5 L12,12.5 C12,15.533 9.533,18 6.5,18 C3.467,18 1,15.533 1,12.5 Z M9.5,2 L7.5,2 C7.224,2 7,2.224 7,2.5 L7,4.5 C7,4.776 7.224,5 7.5,5 L9.5,5 C9.776,5 10,4.776 10,4.5 L10,2.5 C10,2.224 9.776,2 9.5,2 Z M9,4 L8,4 L8,3 L9,3 L9,4 Z"
      />
    </svg>
  </SVGIcon>
);

UsbCable.displayName = "DecorativeIcon";

export default UsbCable;
