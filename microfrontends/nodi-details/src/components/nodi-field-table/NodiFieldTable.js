import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import nodiType from 'components/__types__/nodi';

const NodiFieldTable = ({ t, nodi }) => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>{t('common.name')}</TableCell>
        <TableCell>{t('common.value')}</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>
          <span>{t('entities.nodi.id')}</span>
        </TableCell>
        <TableCell>
          <span>{nodi.id}</span>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <span>{t('entities.nodi.field1')}</span>
        </TableCell>
        <TableCell>
          <span>{nodi.field1}</span>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

NodiFieldTable.propTypes = {
  nodi: nodiType,
  t: PropTypes.func.isRequired,
};

NodiFieldTable.defaultProps = {
  nodi: [],
};

export default withTranslation()(NodiFieldTable);
