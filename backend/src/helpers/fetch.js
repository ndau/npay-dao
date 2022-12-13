/* ----- ---- --- -- -
 * Copyright 2020 The Axiom Foundation. All Rights Reserved.
 *
 * Licensed under the Apache License 2.0 (the "License").  You may not use
 * this file except in compliance with the License.  You can obtain a copy
 * in the file LICENSE in the source distribution or at
 * https://www.apache.org/licenses/LICENSE-2.0.txt
 * - -- --- ---- -----
 */

import axios from 'axios';

export const NODES_ENDPOINT = 'https://s3.us-east-2.amazonaws.com/ndau-json/services.json';
export const DEFAULT_NODE_NAME = 'mainnet';
export const HTTP_REQUEST_HEADER = {
  method: 'GET',
  mode: 'no-cors',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
};

/// //////////////////////////////////////
// ACCOUNT
/// //////////////////////////////////////

export const getAccount = async (address) => {
  const endpoint = await getNodeEndpoint();
  const accountDetailsEndpoint = `${endpoint}/account/account/${address}`;
  console.log('accountDetailsEndpoint:', accountDetailsEndpoint);
  try {
    let resp = await axios.get(accountDetailsEndpoint, HTTP_REQUEST_HEADER);

    if (resp && resp.status == 200) {
      console.log(resp.data);
      return resp.data;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
};

/// //////////////////////////////////////
// NODE
/// //////////////////////////////////////

export const getNodeStatus = async (endpoint) => {
  const nodeEndpoint = endpoint || (await getNodeEndpoint());
  const statusEndpoint = `${nodeEndpoint}/node/status`;

  return axios
    .get(statusEndpoint, HTTP_REQUEST_HEADER)
    .then((response) => {
      const status = response.data.sync_info;
      return status;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const getNodeHealth = async (nodeEndpoint) => {
  const healthEndpoint = `${nodeEndpoint}/health`;
  axios.defaults.timeout = 2000;
  const source = axios.CancelToken.source();
  const timeout = setTimeout(() => {
    source.cancel();
    axios.defaults.timeout = 0;
    return 'Offline';
  }, 2000);

  return axios
    .get(healthEndpoint, HTTP_REQUEST_HEADER, { cancelToken: source.token })
    .then((response) => {
      clearTimeout(timeout);
      axios.defaults.timeout = 0;
      return response.data;
    })
    .catch((error) => {
      axios.defaults.timeout = 0;
      // console.error(error);
    });
};

export const getNodeEndpoint = async (node) => {
  var nodeEndpoint, health;
  //  var catchingUp
  while (true) {
    nodeEndpoint = await tryNodeEndpoint(node);
    health = await getNodeHealth(nodeEndpoint);
    if (health === 'OK') {
      //      catchingUp = await getNodeStatus(node)
      //      if (catchingUp.catching_up) {
      //
      //        continue
      //      }
      return nodeEndpoint;
    } else {
      //
    }
  }
};

export const tryNodeEndpoint = async (nodeName) => {
  const response = await axios.get(NODES_ENDPOINT, HTTP_REQUEST_HEADER);
  const { networks } = response.data;
  const nodeKey = networks[nodeName] ? nodeName : DEFAULT_NODE_NAME;
  const nodes = networks[nodeKey] && networks[nodeKey]['nodes'];
  const randomNodeIndex = Math.floor(Math.random() * Object.keys(nodes).length);
  const randomNode = Object.values(nodes)[randomNodeIndex];
  const nodeEndpoint = randomNode && randomNode.api;
  //
  return 'https://' + nodeEndpoint;
};

//
export const validURL = (str) => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
};
