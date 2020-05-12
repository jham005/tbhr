import PropTypes from 'prop-types';
import React from 'react';
import Results from './Results.js';
import RaceWinners from './RaceWinners.js';
import Image from '../components/Image';

class Main extends React.Component {
  render() {
    let close = (
<div
  role="button"
  className="close"
  onClick={() => { this.props.onCloseArticle(); }}>
</div>);

    const Article = ({children, id}) =>
<article
  id={id}
  className={`${this.props.article === `${id}` ? 'active' : ''} ${this.props.articleTimeout ? 'timeout' : ''}`}
  style={{ display: 'none' }}>
  <h2 className="major">{id}</h2>
  {children}
  {close}
</article>;

    Article.propTypes = {
      children: PropTypes.node.isRequired,
    };

    return (
<div
  ref={this.props.setWrapperRef}
  id="main"
  style={this.props.timeout ? { display: 'flex' } : { display: 'none' }}>
  <Article id="about">
    <Image src="pic01.jpg" alt="" />
    <p>
      The Two Breweries Hill Race was first run in 1983, and is one of the "long classic" Scottish hill races.
      The race is held on the 4th Saturday in September, starting on the lawn in front of the
      historic courtyard gates at <a href="http://www.traquair.co.uk/">Traquair House</a> at 12 noon and finishing at
      &nbsp;<a href="https://broughtonales.co.uk/">Broughton Ales</a> brewery.
    </p>
    <p>
      The record (2:33:57) was set by John Taylor in 1991. John was an
      international athlete who died in 2002, aged 33, from a heart
      condition known as cardiomyopathy. The
      <a href="http://www.johntaylorfoundation.org.uk/"> John Taylor Foundation </a>
      was created to raise awareness of this
      condition, and to assist young athletes. The womens record
      (2:53:56) was set by <a href="https://en.wikipedia.org/wiki/Angela_Mudge">Angela Mudge</a> in 2000.
    </p>
    <h2>Previous race winners</h2>
    <RaceWinners/>
    <p>
      You can find photos of previous races
      on <a href="https://www.flickr.com/search/?text=two%20breweries%20hill%20race">Flickr</a>.
    </p>
  </Article>

  <Article id="route">
    <Image src="pic02.jpg" alt="" />
    <p>
      The race is around 30km / 18 miles, and includes some
      1500m / 4900ft of ascent. The terrain predominantly
      follows hill tracks, but includes sections of open heather
      with some short sections along country roads.
      A custom Harveys map of the route (1:40k scale, double-sided on waterproof paper, with all checkpoints marked)
      is available for £5 at race registration, or contact the organisers.
    </p>
    <p>
      This race is an arduous event which should not be
      undertaken by runners who are unfit or are inexperienced
      in the hills. <b>Full emergency kit</b> comprising wind
      and waterproof full body cover, a map of the entire race
      route, orienteering-type compass, whistle and food
      equivalent to a chocolate bar must be carried by all
      runners. Runners must be at least 18 years old.
    </p>
    <p>
      There are eight marshalled checkpoints. Water is available
      at Glenrath Farm and Stobo Home Farm. These checkpoints
      are also retiral points. Hill rescue cover is provided by
      &nbsp;<a href="http://moffatmrt.scottishmountainrescue.org/">Moffat
	Mountain Rescue</a>.
    </p>
    <table>
      <tbody>
	<tr><th></th><th>OS grid reference</th><th>Closing time</th></tr>
	<tr><td>Birkscairn Hill</td><td>73/275332</td><td>1315</td></tr>
 	<tr><td>Hundleshope    </td><td>73/250339</td><td>1350</td></tr>
 	<tr><td>Stob Law       </td><td>73/230333</td><td>1425</td></tr>
	<tr><td>Glenrath Farm  </td><td>73/207342</td><td>1440</td></tr>
 	<tr><td>Whitelaw Hill  </td><td>72/193354</td><td>1505</td></tr>
	<tr><td>Stobo Home Farm</td><td>72/179370</td><td>1530</td></tr>
 	<tr><td>Trahenna Hill  </td><td>72/136374</td><td>1630</td></tr>
 	<tr><td>Ratchill Farm  </td><td>72/119364</td><td>1650</td></tr>
      </tbody>
    </table>
    <p>
      This fly-over of the route will give you an idea of what to expect.<br />
      <iframe
	src="https://www.youtube.com/embed/X9NhxV5sei8"
	title="Flyover"
	width="560"
	height="315"
	frameBorder="0"
	allowFullScreen />
    </p>
  </Article>
  
  <Article id="entries">
    <Image src="pic03.jpg" alt="" />
    <p>
      Entries usually opened around Easter. However, we have delayed opening entries this year due to the current uncertainty around Covid-19.
    </p>
    <p>
      The race is on-line pre-entry, via <a href="https://www.entrycentral.com/TwoBreweriesHillRace">Entry
      Central</a>. If you are unable to enter on-line, please contact
      the race director.
    </p>
    <div className='entryCentral-simple-widget' data-product-id='100585'></div>
    <p>
      A bus leaves Broughton for Traquhair at 10am, with race
      registration at Traquhair. There is a strict kit-check
      before the race.
    </p>
    <p>
      Prize giving is held at Broughton Village Hall, where
      runners and supporters can enjoy hot soup, cake and
      perhaps even a well-earned beer!
    </p>
    {close}
  </Article>
  
  <Article id="results">
    <Results/>
  </Article>
  
  <Article id="local">
    <Image src="pic04.jpg" alt="" />
    <p>
      We are delighted to be supported
      by <a href="http://www.traquair.co.uk">Traquair House</a>
      &nbsp;and <a href="https://broughtonales.co.uk">Broughton Ales</a>,
      both of whose fine products regularly appear as prizes. The race
      would not be possible without the kind permission of the local
      landowners.
    </p>
    <p>
      We are also delighted to be associated
      with <a href="http://tweedgreen.org/">Tweedgreen</a>, a
      voluntary organisation of local people working towards a
      self-sustaining Tweeddale by promoting local food, encouraging
      local energy generation, and reducing energy use and waste.
    </p>
    <p>
      Locals taking part will appreciate the beauty and interests of
      the Scottish Borders. Those coming from further afield may be
      interested in what the Borders has to offer. Why not treat the
      family to a weekend away!  Local accommodation and information
      about the area can be found at the following tourism sites:
    </p>
    <ul>
      <li><a href="https://www.visitscotland.com/destinations-maps/scottish-borders/">Visit Scotland</a></li>
      <li><a href="http://www.touristnetuk.com/scotland/borders/">TouristNet</a></li>
    </ul>
  </Article>
	
  <Article id="links">
    <Image src="pic05.jpg" alt="" />
    <ul>
      <li>
	Facebook
	&mdash; <a href="https://www.facebook.com/twobreweries.org.uk/">www.facebook.com/twobreweries.org.uk</a>,
	a public forum for discussions about the race.
      </li>
      <li>
	Scottish Hill Runners
	&mdash; <a href="http://www.scottishhillrunners.uk">www.scottishhillrunners.uk</a>
	&nbsp;is an independent organisation supporting hill running in
	Scotland. SHR organises the Scottish Championship race series,
	and provides race insurance for the TBHR. The images on this
	web site are courtesy of SHR.
      </li>
      <li>
	Scottish Hill Racing
	&mdash; <a href="http://www.scottishhillracing.co.uk">www.scottishhillracing.co.uk</a>
	&nbsp;contains a comprehensive calendar and results for hill races
	all across Scotland.
      </li>
      <li>
	Moffat Mountain Rescue
	&mdash; <a href="http://moffatmrt.scottishmountainrescue.org/donate/">moffatmrt.scottishmountainrescue.org</a>
	&nbsp;provide hill cover for the TBHR. If the weather closes in, you
	will be glad to know they are out there.
      </li>
      <li>
	The Fell Runners Association
	&mdash; <a href="http://www.fellrunner.org.uk">www.fellrunner.org.uk</a>,
	a UK-wide fell running organisation.
      </li>
      <li>
	Scottish Athletics
	&mdash; <a href="http://www.scottishathletics.org.uk">www.scottishathletics.org.uk</a>,
	the national governing body for athletics in Scotland.
      </li>
      <li>
	Westerlands Cross Country Club
	&mdash; <a href="http://www.westerlandsccc.co.uk">www.westerlandsccc.co.uk</a>,
	arguably one of the best small-to-medium sized hill running
	clubs in the West End of Glasgow. The TBHR is one of seven or
	so hill running events organised each year by the Westies.
      </li>
    </ul>
  </Article>
  
  <Article id="contact">
    <p>
      Please feel free to contact us if you have any questions about the race.
    </p>
    <form name="contact" method="post" data-netlify="true">
      <input type="hidden" name="form-name" value="contact" />
      <div className="field half first">
	<label htmlFor="name">Your name</label>
	<input type="text" name="name" id="name" />
      </div>
      <div className="field half">
	<label htmlFor="email">Your email</label>
	<input type="text" name="email" id="email" />
      </div>
      <div className="field">
	<label htmlFor="message">Message</label>
	<textarea name="message" id="message" rows="6"></textarea>
      </div>
      <div data-netlify-recaptcha="true" />
      <ul className="actions">
	<li><input type="submit" value="Send Message" className="special" /></li>
      </ul>
    </form>
    <p>
      Please check your email address is correct. You may like
      to include an alternative contact method in the body of
      your email, such as a phone number.
    </p>
  </Article>
</div>
)
}
}

Main.propTypes = {
  route: PropTypes.object,
  article: PropTypes.string,
  articleTimeout: PropTypes.bool,
  onCloseArticle: PropTypes.func,
  timeout: PropTypes.bool,
  setWrapperRef: PropTypes.func.isRequired,
}

export default Main;
