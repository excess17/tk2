import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Fab } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import DeleteForever from '@material-ui/icons/DeleteForever';
import { withStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';

import keycloakType from 'components/__types__/keycloak';
import withKeycloak from 'auth/withKeycloak';
import { AuthenticatedView, UnauthenticatedView } from 'auth/KeycloakViews';
import ConfirmationDialogTrigger from 'components/common/ConfirmationDialogTrigger';
import PaginationWrapper from 'components/pagination/PaginationWrapper';
import withPagination from 'components/pagination/withPagination';
import FiltersContainer from 'components/filters/FiltersContainer';
import NodiTable from 'components/NodiTable';
import Notification from 'components/common/Notification';
import { apiNodisGet, apiNodisDelete } from 'api/nodis';
import { reducer, initialState } from 'state/nodi.reducer';
import { ADD_FILTER, UPDATE_FILTER, DELETE_FILTER, CLEAR_FILTERS } from 'state/filter.types';
import { DELETE, ERROR_FETCH, CLEAR_ERRORS, READ_ALL, CLEAR_ITEMS } from 'state/nodi.types';

const styles = {
  fab: {
    float: 'right',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
  },
};

class NodiTableContainer extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;

    this.handleDelete = this.handleDelete.bind(this);
    this.handleError = this.handleError.bind(this);
    this.closeNotification = this.closeNotification.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.addFilter = this.addFilter.bind(this);
    this.removeFilter = this.removeFilter.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
  }

  componentDidMount() {
    const { keycloak } = this.props;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated) {
      this.fetchData();
    }
  }

  componentDidUpdate(prevProps) {
    const { keycloak, paginationMode, pagination } = this.props;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    const changedAuth = prevProps.keycloak.authenticated !== authenticated;
    const changedPagination =
      ['pagination', 'infinite-scroll'].includes(paginationMode) &&
      (prevProps.pagination.currentPage !== pagination.currentPage ||
        prevProps.pagination.itemsPerPage !== pagination.itemsPerPage);

    if (authenticated && (changedAuth || changedPagination)) {
      this.fetchData();
    }
  }

  dispatch(action, afterSetState = () => {}) {
    this.setState((prevState) => reducer(prevState, action), afterSetState);
  }

  async fetchData() {
    const { filters, items } = this.state;
    const { keycloak, paginationMode, pagination, config } = this.props;
    const serviceUrl =
      config &&
      config.systemParams &&
      config.systemParams.api &&
      config.systemParams.api['nodi-api'].url;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated) {
      try {
        const requestParameters = {
          filters,
          ...(paginationMode === ''
            ? {}
            : {
                pagination: {
                  page: pagination.currentPage,
                  rowsPerPage: pagination.itemsPerPage,
                },
              }),
        };

        const { nodis, headers } = await apiNodisGet(serviceUrl, requestParameters);
        const nodiCount = (headers && headers['X-Total-Count']) || 0;

        this.dispatch({
          type: READ_ALL,
          payload: {
            items: paginationMode === 'infinite-scroll' ? [...items, ...nodis] : nodis,
            count: nodiCount,
          },
        });
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  updateFilter(filterId, values) {
    this.dispatch({ type: UPDATE_FILTER, payload: { values, filterId } });
  }

  addFilter() {
    this.dispatch({ type: ADD_FILTER });
  }

  removeFilter(filterId) {
    this.dispatch({ type: DELETE_FILTER, payload: { filterId } }, this.fetchData);
  }

  clearFilters() {
    this.dispatch({ type: CLEAR_FILTERS }, this.fetchData);
  }

  applyFilters() {
    this.dispatch({ type: CLEAR_ITEMS }, this.fetchData);
  }

  closeNotification() {
    this.dispatch({ type: CLEAR_ERRORS });
  }

  handleError(err) {
    const { onError, t } = this.props;
    onError(err);
    this.dispatch({
      type: ERROR_FETCH,
      payload: {
        message: t('error.dataLoading'),
        status: Notification.ERROR,
      },
    });
  }

  async handleDelete(item) {
    const { t, onDelete, keycloak, config } = this.props;
    const serviceUrl =
      config &&
      config.systemParams &&
      config.systemParams.api &&
      config.systemParams.api['nodi-api'].url;
    const authenticated = keycloak.initialized && keycloak.authenticated;

    if (authenticated) {
      try {
        await apiNodisDelete(serviceUrl, item.id);
        onDelete(item);
        this.dispatch({ type: DELETE, payload: { id: item.id } });
        this.setState({
          notificationMessage: t('common.dataDeleted'),
          notificationStatus: Notification.SUCCESS,
        });
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  handleConfirmationDialogAction(action, item) {
    switch (action) {
      case ConfirmationDialogTrigger.CONFIRM: {
        this.handleDelete(item);
        break;
      }
      default:
        break;
    }
  }

  render() {
    const { items, count, notificationMessage, notificationStatus, filters } = this.state;
    const { classes, onSelect, onAdd, onDelete, t, keycloak, paginationMode = '' } = this.props;
    const deleteLabel = t('common.delete');

    const Actions = ({ item }) =>
      onDelete ? (
        <ConfirmationDialogTrigger
          onCloseDialog={(action) => this.handleConfirmationDialogAction(action, item)}
          dialog={{
            title: t('entities.nodi.deleteDialog.title'),
            description: t('entities.nodi.deleteDialog.description'),
            confirmLabel: t('common.yes'),
            discardLabel: t('common.no'),
          }}
          Renderer={({ onClick }) => (
            <IconButton aria-label={deleteLabel} title={deleteLabel} onClick={onClick}>
              <DeleteForever />
            </IconButton>
          )}
        />
      ) : (
        ''
      );

    return (
      <>
        <UnauthenticatedView keycloak={keycloak}>
          {t('common.notAuthenticated')}
        </UnauthenticatedView>
        <AuthenticatedView keycloak={keycloak}>
          <Fab color="primary" aria-label="add" className={classes.fab} onClick={onAdd}>
            <AddIcon />
          </Fab>
          <FiltersContainer
            applyFilter={this.applyFilters}
            add={this.addFilter}
            update={this.updateFilter}
            remove={this.removeFilter}
            clear={this.clearFilters}
            filters={filters}
            error={this.handleError}
          />
          <PaginationWrapper items={items} paginationMode={paginationMode} count={count}>
            <div className={classes.tableWrapper}>
              <NodiTable items={items} onSelect={onSelect} Actions={Actions} />
            </div>
          </PaginationWrapper>
        </AuthenticatedView>
        <Notification
          status={notificationStatus}
          message={notificationMessage}
          onClose={this.closeNotification}
        />
      </>
    );
  }
}

NodiTableContainer.propTypes = {
  classes: PropTypes.shape({
    fab: PropTypes.string,
    tableWrapper: PropTypes.string,
  }).isRequired,
  onAdd: PropTypes.func,
  onError: PropTypes.func,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
  t: PropTypes.func.isRequired,
  keycloak: keycloakType.isRequired,
  paginationMode: PropTypes.string,
  pagination: PropTypes.shape({
    currentPage: PropTypes.number,
    itemsPerPage: PropTypes.number,
  }),
  config: PropTypes.object,
};

NodiTableContainer.defaultProps = {
  onAdd: () => {},
  onDelete: () => {},
  onError: () => {},
  onSelect: () => {},
  paginationMode: '',
  pagination: null,
  config: {},
};

export default withKeycloak(
  withStyles(styles)(
    withTranslation(undefined, { withRef: true })(withPagination(NodiTableContainer))
  )
);
