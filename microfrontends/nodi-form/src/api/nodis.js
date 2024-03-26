import { getDefaultOptions, request } from 'api/helpers';

const resource = 'api/nodis';

export const apiNodiGet = async (serviceUrl, id) => {
  const url = `${serviceUrl}/${resource}/${id}`;
  const options = {
    ...getDefaultOptions(),
    method: 'GET',
  };
  return request(url, options);
};

export const apiNodiPost = async (serviceUrl, nodi) => {
  const url = `${serviceUrl}/${resource}`;
  const options = {
    ...getDefaultOptions(),
    method: 'POST',
    body: nodi ? JSON.stringify(nodi) : null,
  };
  return request(url, options);
};

export const apiNodiPut = async (serviceUrl, id, nodi) => {
  const url = `${serviceUrl}/${resource}/${id}`;
  const options = {
    ...getDefaultOptions(),
    method: 'PUT',
    body: nodi ? JSON.stringify(nodi) : null,
  };
  return request(url, options);
};

export const apiNodiDelete = async (serviceUrl, id) => {
  const url = `${serviceUrl}/${resource}/${id}`;
  const options = {
    ...getDefaultOptions(),
    method: 'DELETE',
  };
  return request(url, options);
};
