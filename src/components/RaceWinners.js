import React from "react";
import { useStaticQuery, graphql } from "gatsby";

const RaceWinners = () => {
  const data = useStaticQuery(graphql`{
  winners: allResultsCsv(sort: {fields: Time}) {
    group(field: Year, limit: 1) {
      nodes {
        Club
        Name
        Time
        Year
      }
    }
  }
  female: allResultsCsv(filter: {Cat: {glob: "F*"}}, sort: {fields: Time}) {
      group(field: Year, limit: 1) {
        nodes {
          Year
          Name
          Time
          Club
        }
      }
    }
}`);

  return <table>
           <thead>
             <tr><th>Year</th><th>Name</th><th>Time</th><th>Club</th></tr>
           </thead>
           <tbody>
             <>
               { data
                 .winners
                 .group
                 .concat(data.female.group)
                 .sort((l, r) => r.nodes[0].Year - l.nodes[0].Year)
                 .map(g =>
                      <tr>
                        <td>{g.nodes[0].Year}</td>
                        <td>{g.nodes[0].Name}</td>
                        <td>{g.nodes[0].Time}</td>
                        <td>{g.nodes[0].Club}</td>
                      </tr>) }
             </>
	   </tbody>
	 </table>;
};

export default RaceWinners;
