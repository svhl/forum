import React from 'react';
import './ScreenTooSmall.css';

const ScreenTooSmall = () => (
  <div className="screen-too-small-overlay">
    <div>
      ⚠ This site only works on screens that are &gt;1000 px<br /><br />
      Please open this site on a desktop or a larger display<br /><br /><br /><br />
      <div className="footer">
        &copy; {new Date().getFullYear()} The 4M. All rights reserved.
      </div>
    </div>
  </div>
);

export default ScreenTooSmall;