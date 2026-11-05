const en = {
  apps: {
    orders: {
      attributes: {
        status: "Status",
        payment_status: "Payment status",
        fulfillment_status: "Fulfillment status",
      },
      tasks: {
        cart: "Cart",
        archived: "Archived",
        request_return: "Request return",
        awaiting_customer_review: "Awaiting customer review",
        rejected_by_customer: "Rejected by customer",
      },
      details: {
        summary: "Summary",
        to_be_calculated: "To be calculated",
        shipping: "Shipping",
        subtotal: "Subtotal",
        total: "Total",
        payment_method: "Payment method",
        taxes: "Taxes",
        included: "included",
        discount: "Discount",
        use_for_shipping: "Use for shipping",
        use_for_billing: "Use for billing",
        new_total_line1:
          "The new total is {{new_total}}, {{difference}} more than the original total.",
        new_total_line2: "Adjust the total to make it equal or less.",
        waiting_for_successful_capture: "Waiting for successful capture",
        review_reason: "Note for the customer",
        review_reason_placeholder: "Add a note…",
        send_for_review_description:
          "The customer will be notified and asked to review and confirm the updated order",
        sending_for_review: "Sending order for review…",
        sending_for_review_to: "to {{email}}",
        send_for_review_failed: "Could not send the order for review",
        review_sent_title: "Your order has been sent for review",
        review_sent_description:
          "{{customer}} has been notified and can now review your order",
        view_order: "View order",
        back_to_orders: "Back to orders",
        withdraw_review_description:
          "The order leaves hold and can be approved again without the customer's answer.",
      },
      form: {
        language: "Language",
        language_hint: "The language used for checkout",
        error_create_order:
          "Cannot create the order without a valid item. Please select one.",
        email: "Email",
        email_placeholder: "Search or add email",
        email_hint: "The customer's email for this order.",
        coupon_code: "Coupon code",
        select_adjustment_amount:
          "Select a positive amount type to increase the order total.",
        manual_adjustment_name: "Manual adjustment",
      },
      actions: {
        add_item: "Add item",
        approve: "Approve",
        archive: "Archive",
        cancel_transactions: "Cancel payment",
        cancel: "Cancel order",
        capture_payment: "Capture payment",
        capture: "Capture",
        place: "Place order",
        refund: "Refund",
        unarchive: "Unarchive",
        continue_editing: "Continue editing",
        finish_editing: "Finish",
        send_for_review: "Send to customer for review",
        send_for_review_title: "Send order for review?",
        send_for_review_confirm: "Send for review",
        withdraw_review: "Withdraw review",
        withdraw_review_title: "Withdraw the review?",
        adjust_total: "Adjust total",
      },
    },
    returns: {
      details: {
        origin: "Origin",
        destination: "Destination",
        to_destination: "To",
      },
    },
  },
}

export default en
