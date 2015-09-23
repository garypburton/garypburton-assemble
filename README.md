#Static site generator using data from Wordpress API

Experimenting with different ways of using Wordpress. In this instance using it purely as a CMS to edit page content and then generate a static site using that data.

Grunt is used to curl the API end point and create the empty handlebars templates (if they don't exist) and also seperate data files per page.

    npm install

To pull in data from wordpress API and generate data files run

    grunt dataInit

Then run

    grunt serve

