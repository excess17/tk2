import React from 'react';
import ReactDOM from 'react-dom';
import retargetEvents from 'react-shadow-dom-retarget-events';

import { StylesProvider, ThemeProvider, jssPreset } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core';
import { create as jssCreate } from 'jss';

import KeycloakContext from 'auth/KeycloakContext';
import setLocale from 'i18n/setLocale';
import {
  createWidgetEventPublisher,
  subscribeToWidgetEvent,
  subscribeToWidgetEvents,
} from 'helpers/widgetEvents';
import {
  INPUT_EVENT_TYPES,
  OUTPUT_EVENT_TYPES,
  KEYCLOAK_EVENT_TYPE,
} from 'custom-elements/widgetEventTypes';
import NodiEditFormContainer from 'components/NodiEditFormContainer';
import NodiAddFormContainer from 'components/NodiAddFormContainer';

const getKeycloakInstance = () =>
  (window &&
    window.entando &&
    window.entando.keycloak && { ...window.entando.keycloak, initialized: true }) || {
    initialized: false,
  };

const ATTRIBUTES = {
  id: 'id',
  hidden: 'hidden',
  locale: 'locale',
  disableDefaultEventHandler: 'disable-default-event-handler', // custom element attribute names MUST be written in kebab-case
  config: 'config',
};

class NodiFormElement extends HTMLElement {
  jss;

  container;

  mountPoint;

  keycloak = getKeycloakInstance();

  unsubscribeFromWidgetEvents;

  unsubscribeFromKeycloakEvent;

  defaultEventHandlerDisabled;

  onCreate = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.create);

  onCancelEditing = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.cancelEditing);

  onDelete = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.delete);

  onUpdate = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.update);

  onErrorCreate = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.errorCreate);

  onErrorUpdate = createWidgetEventPublisher(OUTPUT_EVENT_TYPES.errorUpdate);

  muiTheme;

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

    this.jss = jssCreate({
      ...jssPreset(),
      insertionPoint: this.container,
    });

    this.muiTheme = createMuiTheme({
      props: {
        MuiDialog: {
          container: this.mountPoint,
        },
        MuiPopover: {
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
      const {
        tableAdd,
        cancelEditing,
        create,
        edit,
        delete: performDelete,
        tableSelect,
        update,
      } = INPUT_EVENT_TYPES;
      const { id } = ATTRIBUTES;
      switch (evt.type) {
        case tableAdd: {
          this.setAttribute(id, '');
          break;
        }
        case edit: {
          this.hidden = false;
          this.setAttribute(id, evt.detail.payload.id);
          break;
        }
        case create:
        case cancelEditing:
        case update: {
          this.hidden = true;
          break;
        }
        case performDelete: {
          this.hidden = true;
          this.setAttribute(id, '');
          break;
        }
        case tableSelect: {
          this.setAttribute(id, evt.detail.payload.id);
          break;
        }
        default:
          throw new Error(`Unsupported event: ${evt.type}`);
      }
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
    const attributeConfig = this.getAttribute(ATTRIBUTES.config) || '';
    const config = attributeConfig && JSON.parse(attributeConfig);

    const hidden = this.getAttribute(ATTRIBUTES.hidden) === 'true';
    if (hidden) {
      ReactDOM.render(<></>);
      return;
    }

    const locale = this.getAttribute(ATTRIBUTES.locale);
    setLocale(locale);

    const id = this.getAttribute(ATTRIBUTES.id);

    const FormContainer = id
      ? React.createElement(
          NodiEditFormContainer,
          { id, onUpdate: this.onUpdate, onError: this.onErrorUpdate, config: config },
          null
        )
      : React.createElement(
          NodiAddFormContainer,
          { onCreate: this.onCreate, onError: this.onErrorCreate, config: config },
          null
        );

    ReactDOM.render(
      <KeycloakContext.Provider value={this.keycloak}>
        <StylesProvider jss={this.jss}>
          <ThemeProvider theme={this.muiTheme}>{FormContainer}</ThemeProvider>
        </StylesProvider>
      </KeycloakContext.Provider>,
      this.mountPoint
    );
  }
}

customElements.define('nodi-form', NodiFormElement);
