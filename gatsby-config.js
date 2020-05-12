const { typeNameFromDir } = require("gatsby-transformer-csv");

module.exports = {
  siteMetadata: {
    title: "Two Breweries Hill Race",
    author: "John Hamer",
    description: "An classic long hill race in the Scottish Borders"
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Two Breweries Hill Race',
        short_name: 'TBHR',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/favicon.png',
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `results`,
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: `gatsby-transformer-csv`,
      options: {
	typeName: typeNameFromDir
      }
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    'gatsby-plugin-sass',
    `gatsby-plugin-styled-components`,
    'gatsby-plugin-offline',
  ],
}
