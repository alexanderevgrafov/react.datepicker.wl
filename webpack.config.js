var webpack = require( 'webpack' );

module.exports = {
     entry: {
	'react-datepicker-wl':"./react-datepicker-wl.jsx",
	'demo':"./demo.jsx"
	},

     output : {
       filename : './[name].js'
     },

     devtool : 'source-map',
     
    plugins : [
        new webpack.ProvidePlugin( {
            _          : "underscore"
        } ),

        new webpack.optimize.DedupePlugin()
    ],

    module : {
        loaders : [
            {
                test    : /\.jsx?$/,
                exclude : /(node_modules|lib)/,
                loader  : 'babel?optional[]=runtime'
            },

            {
                test   : /\.less$/,
                loader : "style-loader!css-loader!less-loader"
            },

            { test : /\.css$/, loader : "style-loader!css-loader" },
            { test : /\.png$/, loader : "url-loader?limit=100000" },
            { test : /\.(jpg|gif)$/, loader : "file-loader" },
        ]
    }

};
