# REST API URL Guide

## Represent Hierarchical relationships by '/'

**Example**
http://localhost:5001/ProductCategory/SubCategory/Products

---

## Use plural nouns when required

**Example**
http://localhost:5001/Users/

---

## Design to improve readability

Use '-' instead of '\_' or camelCase

---

## For filtering, use query parameters

**Example**
http://localhost:5001/Organization/Departments?name=HR

---

## Do not write CRUD operation in URL

**Example**
Use http://localhost:5001/Organization/Departments with Get method

instead of http://localhost:5001/Organization/Get-Departments

---

## Use parameters in the right order

**Example**
Use http://localhost:5001/Organization/:id/Department/:id

To get a department in a organization

---

## Use lowcase everywhere

---

## Do not use trailing forward slash '/'

Use http://localhost:5001/Organization

Instead of http://localhost:5001/Organization/

---

## In body request do not use '-' (JavaScript/Json don't handle it)

---

## GET

code 200 for "OK"
return object

## POST

code 201 for "Created"
return id

## PUT

code 200 for "OK"
return object

## DELETE

code 200 for "OK"
return nothing

---

## Commons error codes

code 400 for "Bad request" : The server cannot or will not process the request due to an apparent client error.

code 401 for "Unauthorized" : Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.

code 404 for "Not Found" : The requested resource could not be found but may be available in the future.

code 500 for "Internal Server Error" : A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.

---

Sources

- https://restfulapi.net/resource-naming/
- https://tools.ietf.org/html/rfc7231#section-4.3.1
