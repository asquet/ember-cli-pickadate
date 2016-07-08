import Ember from 'ember';
import config from 'ember-get-config';

const { Component, observer } = Ember;

export default Component.extend({
  tagName: 'input',
  attributeBindings: ['placeholder', 'disabled', 'type'],
  disabled: null,
  type: 'text',
  date: null,
  picker: null,

  didRender() {
    this.updateInputText();
    this.toggleInputDisabled();
  },

  getOptions() {
    const defaults = {
      'date': {},
      'time': {}
    };
    const appOptions = config['ember-cli-pickadate'];
    return Ember.assign(defaults, appOptions);
  },

  toggleInputDisabled: function() {
    if(this.get('disabled')) {
      this.get('picker').stop();
      this.$().prop('disabled', true); // pick-a-date is doing funny things with the disabled attribute
    } else {
      this.get('picker').start();
      this.$().prop('disabled', false);
    }
  },

  dateChanged: observer('date', function() {
    this.updateInputText()
  }),

  optionsChanged: observer('options', function() {
    let options = this.get('options'),
        picker = this.get('picker');
    
    if (options.settings) {
      Ember.merge(picker.component.settings, options.settings);
      picker.render(true);
    }
    
    //pick-a-date actually "sets" only options present as fields in this `component.item`
    var settableKeys = Object.keys(picker.component.item); 
    
    if (!Ember.isEmpty(settableKeys)) {
      let settableData = settableKeys.reduce( res, key => {
        result[key] = options[key] || null;
      }, {});
      
      picker.set(settableData); //causes rerender
    }
    
    let unusedKeys = Object.keys(options).filter(key => key !== 'settings').filter(key => !settableKeys.contains(key));
    if (!Ember.isEmpty(unusedKeys)) {
      console.warn('Trying to set unknown options for pick-a-date: ' + unusedKeys.join(', '));
    }
  }),

  onClose(){
    // Prevent pickadate from re-opening on focus
    Ember.$(document.activeElement).blur();
  },

  willDestroyElement() {
    const picker = this.get('picker');
    if (picker && picker.get('start')) {
      picker.stop();
    }
  }
})
