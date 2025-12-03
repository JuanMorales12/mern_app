import React, { Fragment, useContext, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { HomeContext } from "./index";
import { getAllCategory } from "../../admin/categories/FetchApi";
import { getAllProduct } from "../../admin/products/FetchApi";
import axios from "axios";
import "./style.css";

const apiURL = process.env.REACT_APP_API_URL;

const CategoryList = () => {
  const history = useHistory();
  const { data } = useContext(HomeContext);
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let responseData = await getAllCategory();
      if (responseData && responseData.Categories) {
        setCategories(responseData.Categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`${data.categoryListDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="py-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories && categories.length > 0 ? (
          categories.map((item, index) => {
            return (
              <Fragment key={index}>
                <div
                  onClick={(e) =>
                    history.push(`/products/category/${item._id}`)
                  }
                  className="col-span-1 m-2 flex flex-col items-center justify-center space-y-2 cursor-pointer"
                >
                  <img
                    src={`${apiURL}/uploads/categories/${item.cImage}`}
                    alt="pic"
                  />
                  <div className="font-medium">{item.cName}</div>
                </div>
              </Fragment>
            );
          })
        ) : (
          <div className="text-xl text-center my-4">No Category</div>
        )}
      </div>
    </div>
  );
};

const FilterSearchPanel = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [productArray, setProductArray] = useState(null);

  useEffect(() => {
    if (data.filterSearchDropdown) {
      fetchAllProducts();
    }
  }, [data.filterSearchDropdown]);

  const fetchAllProducts = async () => {
    try {
      let responseData = await getAllProduct();
      if (responseData && responseData.Products) {
        setProductArray(responseData.Products);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = async () => {
    dispatch({ type: "loading", payload: true });

    try {
      // Build search parameters
      const searchParams = {};
      if (searchTitle) searchParams.title = searchTitle;
      if (searchDescription) searchParams.description = searchDescription;
      if (minPrice) searchParams.minPrice = minPrice;
      if (maxPrice) searchParams.maxPrice = maxPrice;

      // If no search params, show all products
      if (Object.keys(searchParams).length === 0) {
        dispatch({ type: "setProducts", payload: productArray });
        dispatch({ type: "loading", payload: false });
        return;
      }

      // Call the new search endpoint
      const res = await axios.post(`${apiURL}/api/product/search`, searchParams);

      if (res.data && res.data.Products) {
        dispatch({ type: "setProducts", payload: res.data.Products });
      }
      dispatch({ type: "loading", payload: false });
    } catch (error) {
      console.log(error);
      dispatch({ type: "loading", payload: false });
    }
  };

  const closePanel = () => {
    // Reset all filters
    setSearchTitle("");
    setSearchDescription("");
    setMinPrice("");
    setMaxPrice("");

    // Restore all products
    dispatch({ type: "setProducts", payload: productArray });
    dispatch({ type: "filterSearchDropdown", payload: false });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`${data.filterSearchDropdown ? "" : "hidden"} my-4`}>
      <hr />
      <div className="w-full py-3">
        <div className="flex justify-between items-center mb-3">
          <div className="font-medium text-base">Filter & Search</div>
          <div onClick={closePanel} className="cursor-pointer">
            <svg
              className="w-6 h-6 text-gray-700 hover:bg-gray-200 rounded-full p-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* Search by Title */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="searchTitle" className="text-xs font-medium text-gray-700">
              Title
            </label>
            <input
              id="searchTitle"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              type="text"
              placeholder="Product title..."
            />
          </div>

          {/* Search by Description */}
          <div className="flex flex-col space-y-1">
            <label htmlFor="searchDescription" className="text-xs font-medium text-gray-700">
              Description
            </label>
            <input
              id="searchDescription"
              value={searchDescription}
              onChange={(e) => setSearchDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              type="text"
              placeholder="Product description..."
            />
          </div>

          {/* Price Range */}
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Price: <span className="font-semibold text-yellow-700">${minPrice || 0} - ${maxPrice || 1000}</span>
            </label>
            <div className="relative pt-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>$0</span>
                <span>$1000</span>
              </div>
              <div className="relative h-6">
                {/* Background track */}
                <div className="absolute w-full h-2 bg-gray-300 rounded-lg top-2"></div>

                {/* Active track (yellow) */}
                <div
                  className="absolute h-2 bg-yellow-500 rounded-lg top-2"
                  style={{
                    left: `${((minPrice || 0) / 1000) * 100}%`,
                    right: `${100 - ((maxPrice || 1000) / 1000) * 100}%`,
                  }}
                ></div>

                {/* Min price slider */}
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={minPrice || 0}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (!maxPrice || value <= maxPrice) {
                      setMinPrice(value);
                    }
                  }}
                  className="absolute w-full appearance-none pointer-events-none z-30 top-0"
                  style={{
                    background: 'transparent',
                    pointerEvents: 'auto',
                  }}
                />

                {/* Max price slider */}
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  value={maxPrice || 1000}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (!minPrice || value >= minPrice) {
                      setMaxPrice(value);
                    }
                  }}
                  className="absolute w-full appearance-none pointer-events-none z-30 top-0"
                  style={{
                    background: 'transparent',
                    pointerEvents: 'auto',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSearch}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-1.5 px-6 text-sm rounded-md transition duration-200"
          >
            Apply
          </button>
          <button
            onClick={closePanel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1.5 px-4 text-sm rounded-md transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCategoryDropdown = (props) => {
  return (
    <Fragment>
      <CategoryList />
      <FilterSearchPanel />
    </Fragment>
  );
};

export default ProductCategoryDropdown;
