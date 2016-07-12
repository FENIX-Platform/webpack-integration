var distFolderPath = "dist",
    webpack = require('webpack'),
    Path = require('path'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    packageJson = require("./package.json"),
    ImageminPlugin = require('imagemin-webpack-plugin'),
    //AppCachePlugin = require('appcache-webpack-plugin'),
    languages = ["en"/*, "it"*/],
    production = false,
    plugins = [
        //clean dist folder before build
        new CleanWebpackPlugin(['dist'], {
            //root: '/full/project/path',
            //verbose: true,
            //dry: false
        }),
        // vendor in a separate bundle, hash for long term cache
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            filename: "vendor.[hash].js",
            minChunks: 2,
            children: true
        }),
        new webpack.optimize.AggressiveMergingPlugin({
            minSizeReduce: 1.5,
            //moveToParents: true,
            //entryChunkMultiplicator: 10
        }),
        // create native css output file
        new ExtractTextPlugin("style.[hash].css", {
            allChunks: true
        }),
        // Make sure that the plugin is after any plugins that add images
        // These are the default options:
       /* new ImageminPlugin({
            disable: false,
            optipng: {
                optimizationLevel: 3
            },
            gifsicle: {
                optimizationLevel: 1
            },
            jpegtran: {
                progressive: false
            },
            svgo: {
            },
            pngquant: null, // pngquant is not run unless you pass options here
            plugins: []
        }),*/
        //Merge small chunks that are lower than this min size (in chars)
        new webpack.optimize.MinChunkSizePlugin({
            minChunkSize: 51200, // ~50kb
        }),
        // compile index.html from template and inject hashed js
        new HtmlWebpackPlugin({
            filename: "index.html",
            inject: "body",
            template: "./index.template.html"
        }),
    ];

// plugins included only in production environment
if (production) {

    plugins = plugins.concat([
        // uglify
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
       /* new AppCachePlugin({
            //cache: ['someOtherAsset.jpg'],
            network: null,  // No network access allowed!
            //fallback: ['failwhale.jpg'],
            //settings: ['prefer-online'],
            //exclude: ['file.txt', /.*\.js$/],  // Exclude file.txt and all .js files
            output: 'manifest.appcache'
        })*/
    ]);

}

module.exports = languages.map(function (lang) {

    return {
        debug: !production, //switch loader to debug mode
        devtool: production ? false : 'eval', //source map generation
        entry: {
            app: './src/js/app.js',
            vendor: ['jquery'] //add every vendor
        },
        output: {
            path: Path.join(__dirname, distFolderPath, lang),
            //hash for long term cache
            filename: 'bundle.[hash].js',
            chunkFilename: 'chunk-[id].[hash].js'
        },
        resolve: {
            root: Path.resolve(__dirname),
            alias: {
                css: 'src/css',
                module_simple: 'submodules/module_simple/src',
                module_handlebars: 'submodules/module_handlebars/src',
                'module_nls/nls': 'submodules/module_nls/src/nls/' + lang + "/",
                module_nls: 'submodules/module_nls/src',
                module_json: 'submodules/module_json/src',
                'module_plugins/js/custom': 'src/js/plugins',
                module_plugins: 'submodules/module_plugins/src',
                module_images: 'submodules/module_images/src',
            }
        },
        module: {
            //jshint
            preLoaders: [
                //jshint
                {
                    test: /\.js$/, // include .js files
                    exclude: /node_modules/, // exclude any and all files in the node_modules folder
                    loader: "jshint-loader"
                }
            ],
            loaders: [
                {test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
                {test: /\.hbs$/, loader: "handlebars-loader"},
                {test: /\.json$/, loader: "json-loader"},
                {test: /\.(jpg|png)$/, loader: 'url?limit=30000&name=img/[name].[hash].[ext]'}, //inline images with size less than 30kb
            ],
        },

        plugins: plugins.concat([
            // define global scoped variable, force JSON.stringify()
            new webpack.DefinePlugin({
                __DEVELOPMENT__: !production,
                VERSION: JSON.stringify(packageJson.version),
                LANG: JSON.stringify(lang)
            }),
        ]),

        // more options in the optional jshint object
        jshint: {
            // any jshint option http://www.jshint.com/docs/options/
            // i. e.
            camelcase: true,

            // jshint errors are displayed by default as warnings
            // set emitErrors to true to display them as errors
            emitErrors: false,

            // jshint to not interrupt the compilation
            // if you want any file with jshint errors to fail
            // set failOnHint to true
            failOnHint: false,

            // custom reporter function
            reporter: function (errors) {
            }
        }
    };
});