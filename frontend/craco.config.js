const fs = require('fs');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const redirectServedPath = require('react-dev-utils/redirectServedPathMiddleware');
const paths = require('react-scripts/config/paths');
const getHttpsConfig = require('react-scripts/config/getHttpsConfig');

const host = process.env.HOST || '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT;

module.exports = {
  style: {
    postcss: {
      mode: "extends",
      loaderOptions: {
        postcssOptions: {
          ident: "postcss",
          plugins: [
            require("tailwindcss"),
            require("autoprefixer"),
          ],
        },
      },
    },
  },
  devServer: (devServerConfig) => {
    const proxy = devServerConfig.proxy;
    const disableFirewall =
      !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true';

    // webpack-dev-server 5.x uses setupMiddlewares instead of onBeforeSetupMiddleware/onAfterSetupMiddleware
    const setupMiddlewares = (middlewares, devServer) => {
      // Keep `evalSourceMapMiddleware` middlewares before `redirectServedPath`
      // otherwise will not have any effect. This lets us fetch source contents
      // from webpack for the error overlay.
      middlewares.unshift(evalSourceMapMiddleware(devServer));

      if (fs.existsSync(paths.proxySetup)) {
        // This registers user provided middleware for proxy reasons
        require(paths.proxySetup)(devServer.app);
      }

      // Redirect to `PUBLIC_URL` or `homepage` from `package.json` if url not match
      middlewares.push(redirectServedPath(paths.publicUrlOrPath));

      // This service worker file is effectively a 'no-op' that will reset any
      // previous service worker registered for the same host:port combination.
      // We do this in development to avoid hitting the production cache if
      // it used the same host and port.
      middlewares.push(noopServiceWorkerMiddleware(paths.publicUrlOrPath));

      return middlewares;
    };

    // Create new config without the deprecated properties
    // Note: webpack-dev-server 5.x doesn't have 'https' property - it's configured via 'server' option
    const httpsConfig = getHttpsConfig();
    const newConfig = {
      // Use the already-processed allowedHosts from the original config
      allowedHosts: devServerConfig.allowedHosts,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      },
      compress: true,
      static: {
        directory: paths.appPublic,
        publicPath: [paths.publicUrlOrPath],
        watch: {
          ignored: ignoredFiles(paths.appSrc),
        },
      },
      client: {
        webSocketURL: {
          hostname: sockHost,
          pathname: sockPath,
          port: sockPort,
        },
        overlay: {
          errors: true,
          warnings: false,
        },
      },
      devMiddleware: {
        publicPath: paths.publicUrlOrPath.slice(0, -1),
      },
      host,
      historyApiFallback: {
        disableDotRule: true,
        index: paths.publicUrlOrPath,
      },
      proxy,
      setupMiddlewares,
    };

    // Only add server config if HTTPS is actually enabled
    if (httpsConfig) {
      newConfig.server = {
        type: 'https',
        options: typeof httpsConfig === 'object' ? httpsConfig : {},
      };
    }

    // Explicitly delete deprecated properties that may come from the original config
    delete newConfig.onBeforeSetupMiddleware;
    delete newConfig.onAfterSetupMiddleware;
    delete newConfig.https;

    return newConfig;
  },
};