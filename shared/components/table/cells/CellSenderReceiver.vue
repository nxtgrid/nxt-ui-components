<template>
{{ cellValue }}
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    field: {
      type: String,
      required: true,
    },
    settings: {
      type: Object,
      required: true,
    },
  },

  computed: {
    cellValue() {
      const isSender = this.field === 'meta_sender_type';
      const isReceiver = this.field === 'meta_receiver_type';
      const type = this.data[this.field];
      // log(this.data);

      if(isSender) {
        const senderName1 = this.data['meta_sender_name'];
        const senderName2 = this.data['meta_sender_name_part_2'];
        if(type === 'CONNECTION' && senderName2) return senderName2 + ' (Connection Fee Refund)';
        else if(senderName2) return `${ senderName1 } - ${ senderName2 }`;
        else if(senderName1) return senderName1;
      }

      if(isReceiver) {
        const receiverName1 = this.data['meta_receiver_name'];
        const receiverName2 = this.data['meta_receiver_name_part_2'];
        // console.log(connectionName1);
        // console.log(connectionName2);
        if(type === 'CONNECTION' && receiverName2) return receiverName2 + ' (Connection Fee)';
        else if(type === 'METER' && receiverName2) return `${ receiverName1 } (${ receiverName2 })`;
        else if(receiverName1) return receiverName1;
      }

      return 'Unknown';
    },
  },
};
</script>
