// components/cigar-card/cigar-card.js
Component({
  properties: {
    cigar: {
      type: Object,
      value: {}
    },
    showActions: {
      type: Boolean,
      value: true
    }
  },

  data: {},

  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.properties.cigar.id })
    },

    onAddToHumidor() {
      this.triggerEvent('addhumidor', { id: this.properties.cigar.id })
    }
  }
})