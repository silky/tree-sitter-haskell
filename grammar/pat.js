const {parens} = require('./util.js')

module.exports = {
  pat_field: $ => choice(
    alias('..', $.wildcard),
    seq($._qvar, optional(seq('=', $._nested_pat))),
  ),

  pat_fields: $ => braces(optional(sep1($.comma, $.pat_field))),

  pat_as: $ => seq(field('var', $.variable), token.immediate('@'), field('pat', $._apat)),

  pat_parens: $ => parens($._nested_pat),

  pat_view: $ => seq($._exp, '->', $._nested_pat),

  pat_tuple: $ => parens(sep2($.comma, $._nested_pat)),

  pat_unboxed_tuple: $ => seq('(# ', sep1($.comma, $._nested_pat), $._unboxed_tuple_close),

  pat_list: $ => brackets(sep1($.comma, $._nested_pat)),

  pat_strict: $ => seq($._strict, $._apat),

  pat_irrefutable: $ => seq('~', $._apat),

  pat_negation: $ => seq('-', $._number),

  pat_name: $ => $.variable,

  /**
   * Needed non-inlined for conflict definition.
   */
  _pat_constructor: $ => alias($._qcon, $.pat_name),

  pat_wildcard: _ => '_',

  pat_record: $ => seq(field('con', $._pat_constructor), field('fields', $.pat_fields)),

  _apat: $ => choice(
    $.pat_name,
    $.pat_as,
    $._pat_constructor,
    $.pat_record,
    alias($.literal, $.pat_literal),
    $.pat_wildcard,
    $.pat_parens,
    $.pat_tuple,
    $.pat_unboxed_tuple,
    $.pat_list,
    $.pat_strict,
    $.pat_irrefutable,
  ),

  /**
   * In patterns, application is only legal if the first element is a con.
   */
  pat_apply: $ => seq($._pat_constructor, repeat1($._apat)),

  _lpat: $ => choice(
    $._apat,
    $.pat_negation,
    $.pat_apply,
  ),

  pat_infix: $ => seq($._lpat, $._qconop, $._pat),

  /**
   * Without the precs, a conflict is needed.
   */
  _pat: $ => choice(
    prec(2, $.pat_infix),
    prec(1, $._lpat),
  ),

  /**
   *
   */
  _nested_pat: $ => choice(
    $._pat,
    seq($._pat, $._type_annotation),
    $.pat_view,
  )
}
