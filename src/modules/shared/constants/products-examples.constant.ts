export const createProductResponse = {
    "data": {
      "name": "Apple Iphone Pro max 16",
      "description": null,
      "price": 2000,
      "stock": 15,
      "id": 2,
      "created_at": "2025-01-13T23:34:55.431Z",
      "updated_at": "2025-01-13T23:34:55.431Z",
      "deleted_at": null
    },
    "message": "product is created successfully",
    "status": true
}; 

export const findProductsListResponse = {
    "data": {
      "meta": {
        "page": 1,
        "take": 10,
        "itemsPerPage": 1,
        "total": 1,
        "pageCount": 1,
        "hasPreviousPage": false,
        "hasNextPage": false
      },
      "products": [
        {
          "id": 1,
          "name": "Samsung Galaxy Note 10",
          "price": "800.00",
          "stock": 25,
          "created_at": "2025-01-13T22:53:41.354Z"
        }
      ]
    },
    "message": "OPERATION_SUCCESSED",
    "status": true
};

export const findProductDetailsResponse = {
    "data": {
      "id": 1,
      "name": "Samsung Galaxy Note 10",
      "description": "It is one of samsung smart phones, which is very powerful",
      "price": "800.00",
      "stock": 25,
      "created_at": "2025-01-13T22:53:41.354Z"
    },
    "message": "OPERATION_SUCCESSED",
    "status": true
};

export const updateProductResponse = {
    "data": {
      "id": 1
    },
    "message": "product is updated successfully",
    "status": true
};

export const deleteProductResponse = {
    "data": {},
    "message": "product is deleted successfully",
    "status": true
};
