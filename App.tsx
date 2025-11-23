import React from 'react';
import { recipes } from './data';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Boba Recipes</h1>
      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe.name} className="recipe">
            <h2>{recipe.name}</h2>
            <ul className="ingredient-list">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient}>{ingredient}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
