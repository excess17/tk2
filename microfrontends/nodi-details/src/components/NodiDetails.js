import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';

import nodiType from 'components/__types__/nodi';
import NodiFieldTable from 'components/nodi-field-table/NodiFieldTable';

const NodiDetails = ({ t, nodi }) => {
  return (
    <Box>
      <h3 data-testid="details_title">
        {t('common.widgetName', {
          widgetNamePlaceholder: 'Nodi',
        })}
      </h3>
      <NodiFieldTable nodi={nodi} />
    </Box>
  );
};

NodiDetails.propTypes = {
  nodi: nodiType,
  t: PropTypes.func.isRequired,
};

NodiDetails.defaultProps = {
  nodi: {},
};

export default withTranslation()(NodiDetails);
