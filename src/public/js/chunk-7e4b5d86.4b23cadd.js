(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-7e4b5d86"],{"2a37":function(t,s,e){"use strict";e("5ccf")},"5ccf":function(t,s,e){},c66d:function(t,s,e){"use strict";e.r(s);var i=function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"container mt-3 outer"},[e("h1",[t._v("Profile")]),e("hr"),e("div",{staticClass:"container"},[t.user?e("div",[e("div",{staticClass:"detail"},[e("h3",[t._v("Username")]),e("h5",[t._v(t._s(t.user.username))])]),e("div",{staticClass:"detail"},[e("h3",[t._v("Email")]),e("h5",[t._v(t._s(t.user.email))])]),e("div",{staticClass:"detail"},[e("h3",[t._v("Institue")]),e("h5",[t._v(t._s(t.user.institute))])]),e("div",{staticClass:"detail"},[e("h3",[t._v("Desigation")]),e("h5",[t._v(t._s(t.user.designation))])])]):e("div",[t._v(" Please log in first ")])])])},n=[],a={name:"Profile",data:function(){return{user:null}},mounted:function(){var t=this;this.$store.getters.getLogInStatus&&this.$store.dispatch("fetchProfile").then((function(s){t.user=s}))}},r=a,u=(e("2a37"),e("2877")),c=Object(u["a"])(r,i,n,!1,null,null,null);s["default"]=c.exports}}]);
//# sourceMappingURL=chunk-7e4b5d86.4b23cadd.js.map