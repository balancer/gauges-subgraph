# Subgraph Template

This template includes a general setup for getting started with subgraph development with template support for handling subgraphs which need to be deployed to a number of different networks.

## Automatic deploys

Through Github actions new versions of the subgraph can be automatically deployed once they are merged into the `master` and `staging` branches.

### Setup

In the settings page for your repository, open the secrets tab and create a secret with the name `GRAPH_ACCESS_TOKEN`. Paste in the access token from https://thegraph.com/explorer/dashboard as it's value

In `.github/graph.yaml` and `.github/graph-staging.yaml` update the value of the `GRAPH_SUBGRAPH_NAME` environment variable with the name of your subgraphs. It's recommended to add a `-staging` suffix to the name in `graph-staging.yaml`. Both these subgraphs must already exist, if not you can create them on your [Graph Dashboard](https://thegraph.com/explorer/dashboard)

### Security

Note that anyone with write access to this repository will be able to push new versions of subgraphs to any subgraph owned by the repository owner. Do not give write access to untrusted people if using automatic deploys.

To avoid this security issue you can set up an environment within the repositories settings page which will hold the value of `GRAPH_ACCESS_TOKEN`. This will allow you to review and approve any action runs which will have access to this.
