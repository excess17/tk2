import React from 'react';
import ReactDOM from 'react-dom';
import retargetEvents from 'react-shadow-dom-retarget-events';

import { StylesProvider, jssPreset, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { create } from 'jss';

import KeycloakContext from 'auth/KeycloakContext';
import { PaginationProvider } from 'components/pagination/PaginationContext';
import NodiTableContainer from 'components/NodiTableContainer';
import setLocale from 'i18n/setLocale';
import {
  createWidgetEventPublisher,
  subscribeToWidgetEvents,
  subscribeToWidgetEvent,
  widgetEventToFSA,
} from 'helpers/widgetEvents';
import {
  INPUT_EVENT_TYPES,
  OUTPUT_EVENT_TYPES,
  KEYCLOAK_EVENT_TYPE,
} from 'custom-elements/widgetEventTypes';

const getKeycloakInstance = () =>
  (window &&
    window.entando &&
    window.entando.keycloak && { ...window.entando.keycloak, initialized: true }) || {
    initialized: false,
  };

const ATTRIBUTES = {
  hidden: 'hidden',
  locale: 'locale',
  paginationMode: 'pagination-mode',
  disableDefaultEventHandler: 'disable-default-event-handler', // custom element attribute names MUST be written in kebab-case
  config: 'config',
};

class NodiTableElement extends HTMLElement {
  muiTheme;

  jss;

  container;

  mountPoint;

  unsubscribeFromWidgetEvents;

  unsubscribeFromKeycloakEvent;

  defaultEventHandlerDisabled;

  keycloak = getKeycloakInstance();

  onAdd = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.add);

  onError = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.error);

  onSelect = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.select);

  onDelete = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.delete);

  reactRootRef = React.createRef();

  static get observedAttributes() {
    return Object.values(ATTRIBUTES);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.container || oldValue === newValue) {
      return;
    }
    if (!Object.values(ATTRIBUTES).includes(name)) {
      throw new Error(`Untracked changed attribute: ${name}`);
    }

    if (name === ATTRIBUTES.disableDefaultEventHandler) {
      this.onToggleDisableDefaultEvent();
    }

    this.render();
  }

  connectedCallback() {
    this.container = document.createElement('div');
    this.mountPoint = document.createElement('div');
    this.container.appendChild(this.mountPoint);

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(this.container);

    this.jss = create({
      ...jssPreset(),
      insertionPoint: this.container,
    });

    this.muiTheme = createMuiTheme({
      props: {
        MuiDialog: {
          container: this.mountPoint,
        },
      },
    });

    this.keycloak = { ...getKeycloakInstance(), initialized: true };

    this.unsubscribeFromKeycloakEvent = subscribeToWidgetEvent(KEYCLOAK_EVENT_TYPE, () => {
      this.keycloak = { ...getKeycloakInstance(), initialized: true };
      this.render();
    });

    this.onToggleDisableDefaultEvent();

    this.render();

    retargetEvents(shadowRoot);
  }

  disconnectedCallback() {
    if (this.unsubscribeFromWidgetEvents) {
      this.unsubscribeFromWidgetEvents();
    }
    if (this.unsubscribeFromKeycloakEvent) {
      this.unsubscribeFromKeycloakEvent();
    }
  }

  defaultWidgetEventHandler() {
    return (evt) => {
      const action = widgetEventToFSA(evt);
      this.reactRootRef.current.dispatch(action);
    };
  }

  onToggleDisableDefaultEvent() {
    const disableEventHandler = this.getAttribute(ATTRIBUTES.disableDefaultEventHandler) === 'true';

    if (disableEventHandler !== this.defaultEventHandlerDisabled) {
      if (!disableEventHandler) {
        const defaultWidgetEventHandler = this.defaultWidgetEventHandler();

        this.unsubscribeFromWidgetEvents = subscribeToWidgetEvents(
          Object.values(INPUT_EVENT_TYPES),
          defaultWidgetEventHandler
        );
      } else {
        if (this.unsubscribeFromWidgetEvents) {
          this.unsubscribeFromWidgetEvents();
        }
        if (this.unsubscribeFromKeycloakEvent) {
          this.unsubscribeFromKeycloakEvent();
        }
      }
      this.defaultEventHandlerDisabled = disableEventHandler;
    }
  }

  render() {
    const hidden = this.getAttribute(ATTRIBUTES.hidden) === 'true';
    if (hidden) {
      return;
    }

    const locale = this.getAttribute(ATTRIBUTES.locale);
    setLocale(locale);

    const paginationMode = this.getAttribute(ATTRIBUTES.paginationMode) || '';

    const attributeConfig = this.getAttribute(ATTRIBUTES.config) || '';
    const config = attributeConfig && JSON.parse(attributeConfig);

    ReactDOM.render(
      <KeycloakContext.Provider value={this.keycloak}>
        <StylesProvider jss={this.jss}>
          <ThemeProvider theme={this.muiTheme}>
            <PaginationProvider paginationMode={paginationMode}>
              <NodiTableContainer
                ref={this.reactRootRef}
                onAdd={this.onAdd}
                onDelete={this.onDelete}
                onSelect={this.onSelect}
                onError={this.onError}
                paginationMode={paginationMode}
                config={config}
              />
            </PaginationProvider>
          </ThemeProvider>
        </StylesProvider>
      </KeycloakContext.Provider>,
      this.mountPoint
    );
  }
}

customElements.define('nodi-table', NodiTableElement);
