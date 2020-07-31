import React from 'react';
import PropTypes from 'prop-types';

const Link = props =>
      <li>
        <button
          className="link-button"
          style={{border: "none", boxShadow: "none"}}
          onClick={() => { props.onOpenArticle(props.text.toLowerCase()); }}>
          {props.text}
        </button>
      </li>;

function nextRaceDay() {
  let n = 4; //th
  let day = 6; //Saturday in
  let month = 8; //September
  let now = new Date(Date.now());
  let year = now.getFullYear();
  if (year == 2020) year++; // The event not held in 2020
  let d = new Date(year, month, 1 + (day + 7 - new Date(year, month, 1).getDay()) % 7);
  if (now > new Date(d.getFullYear(), month, d.getDate() + (n - 1) * 7))
    d = new Date(year + 1, month, 1 + (day + 7 - new Date(year + 1, month, 1).getDay()) % 7);
  return new Date(d.getFullYear(), month, d.getDate() + (n - 1) * 7);
}

function ordinalSuffix(n) {
  switch (n % 100) {
  case 11: case 12: case 13: return "th";
  default:
    switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
    }
  }
}

const eventAge = nextRaceDay().getFullYear() - 1984; // Not held 2001 or 2020
const raceDay = nextRaceDay().toLocaleDateString('en-GB', {day: 'numeric', weekday: 'long', month: 'long', year: 'numeric'});

const Header = (props) => (
<header id="header" style={props.timeout ? {display: 'none'} : {}}>
  <div className="content">
    <div className="inner">
      <h1>The {eventAge}<sup>{ordinalSuffix(eventAge)}</sup> Two Breweries Hill Race</h1>
      <p>
	A race from Traquair House in Innerleithen to Broughton in the scenic Scottish Borders. <br/>
        Race category AL: 30 km / 18 miles, 1500m / 4900ft ascent.
      </p>
      <h2 id="next-event">{raceDay}</h2>
    </div>
  </div>
  <nav>
    <ul>
      <Link {...props} text='about' />
      <Link {...props} text='route' />
      <Link {...props} text='entries' />
      <Link {...props} text='results' />
      <Link {...props} text='local' />
      <Link {...props} text='links' />
      <Link {...props} text='contact' />
    </ul>
  </nav>
</header>
)

Header.propTypes = {
    onOpenArticle: PropTypes.func,
    timeout: PropTypes.bool
}

export default Header;
