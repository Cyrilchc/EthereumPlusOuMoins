import React, { Component } from "react";
import Pendu from "./contracts/Pendu.json";
import getWeb3 from "./getWeb3";

import "./App.css";
import "./skeleton.css";

class App extends Component {
  state = {
    Players: [],
    Played: [],
    ProposedNumbers: [],
    Winner: "",
    Hint: "",
    CurrentState: "",
    Tax: 0,
    Pot: 0,
    NumberToGuess: 0,
    web3: null,
    accounts: null,
    contract: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Pendu.networks[networkId];
      const instance = new web3.eth.Contract(
        Pendu.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.sync);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  showTax = async () => {
    try {
      const { contract } = this.state;
      var rawTax = await contract.methods.showTax().call();
      this.setState({ Tax: rawTax })
    }
    catch (error) {
      alert(error.message);
    }
  }

  showPot = async () => {
    try {
      const { contract } = this.state;
      var rawPot = await contract.methods.showPot().call();
      rawPot = rawPot / 1000000000000000000
      this.setState({ Pot: rawPot })
    }
    catch (error) {
      alert(error.message);
    }
  }

  showNumberToGuess = async () => {
    try {
      const { contract } = this.state;
      var rawNumberToGuess = await contract.methods.showNumberToGuess().call();
      this.setState({ NumberToGuess: rawNumberToGuess })
    }
    catch (error) {
      alert(error.message);
    }
  }

  showPlayers = async () => {
    try {
      const { contract } = this.state;
      var rawPlayers = await contract.methods.showPlayers().call();
      this.setState({ Players: rawPlayers })
    }
    catch (error) {
      alert(error.message);
    }
  }

  showPlayed = async () => {
    try {
      const { contract } = this.state;
      var rawPlayed = await contract.methods.showPlayed().call();
      this.setState({ Played: rawPlayed })
    }
    catch (error) {
      alert(error.message);
    }
  }

  showProposedNumbers = async () => {
    try {
      const { contract } = this.state;
      var rawProposedNumbers = await contract.methods.showProposedNumbers().call();
      this.setState({ ProposedNumbers: rawProposedNumbers })
    }
    catch (error) {
      alert(error.message);
    }
  }

  showHint = async () => {
    try {
      const { contract } = this.state;
      var rawHint = await contract.methods.showHint().call();
      this.setState({ Hint: rawHint })
    }
    catch (error) {
      alert(error.message);
    }
  }

  showWinner = async () => {
    try {
      const { contract } = this.state;
      var rawWinner = await contract.methods.showWinner().call();
      this.setState({ Winner: rawWinner })
    }
    catch (error) {
      alert(error.message);
    }
  }

  showCurrentState = async () => {
    try {
      const { contract } = this.state;
      var rawState = await contract.methods.showCurrentState().call();
      let msg = "";
      switch (rawState) {
        case "0":
          msg = "Partie pas encore commencée";
          break;
        case "1":
          msg = "Partie en cours";
          break;
        case "2":
          msg = "Partie terminée";
          break;
        default:
          msg = "Inconnu";
          break;
      }

      this.setState({ CurrentState: msg })
    }
    catch (error) {
      alert(error.message);
    }
  }

  sync = async () => {
    await this.showCurrentState();
    await this.showPlayers();
    await this.showTax();
    await this.showPot();
    await this.showPlayed();
    await this.showProposedNumbers();
    const { CurrentState } = this.state;
    switch (CurrentState) {
      case "Partie pas encore commencée":
        break;
      case "Partie en cours":
        await this.showHint();
        break;
      case "Partie terminée":
        await this.showNumberToGuess();
        await this.showWinner();
        break;
      default:
        break;
    }
  }

  setTax = async () => {
    try {
      const { contract, accounts } = this.state;
      var tax = document.getElementById("newTaxInput").value;
      await contract.methods.setTax(tax).send({ from: accounts[0] });
      this.sync();
    }
    catch (error) {
      alert(error.message);
    }
  }

  addToPlayers = async () => {
    try {
      const { contract, accounts } = this.state;
      var addr = document.getElementById("newPlayerInput").value;
      await contract.methods.addToPlayers(addr).send({ from: accounts[0] });
      this.sync();
    }
    catch (error) {
      alert(error.message);
    }
  }

  setNumberToGuess = async () => {
    try {
      const { contract, accounts } = this.state;
      var nbrToGuess = document.getElementById("newNumberToGuessInput").value;
      await contract.methods.setNumberToGuess(nbrToGuess).send({ from: accounts[0] });
      this.setState({ NumberToGuess: nbrToGuess }) // Pour savoir si le nombre à deviner à été assigné
      this.sync();
    }
    catch (error) {
      alert(error.message);
    }
  }

  startGame = async () => {
    try {
      const { contract, accounts } = this.state;
      await contract.methods.startGame().send({ from: accounts[0] });
      this.sync();
    }
    catch (error) {
      alert(error.message);
    }
  }

  proposeNumber = async () => {
    try {
      const { contract, accounts, Tax, web3 } = this.state;
      var nbr = document.getElementById("proposeNumberInput").value;
      await contract.methods.proposeNumber(nbr).send({ from: accounts[0], value: web3.utils.toWei(Tax, "ether") });
      this.sync();
    }
    catch (error) {
      alert(error.message);
    }
  }

  win = async () => {
    try {
      const { contract, accounts } = this.state;
      await contract.methods.win().send({ from: accounts[0] });
      this.sync();
    }
    catch (error) {
      alert(error.message);
    }
  }

  resetGame = async () => {
    try {
      const { contract, accounts } = this.state;
      await contract.methods.resetGame().send({ from: accounts[0] });
      this.sync();
    }
    catch (error) {
      alert(error.message);
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App" style={{marginTop:'20px'}}>
        <div className="row">
          <div className="six columns">
            <h1>Jeu du plus ou moins</h1>
            <hr />
            <h3>
              État actuel du jeu : {this.state.CurrentState}
            </h3>
            <hr />
            {
              (() => {
                switch (this.state.CurrentState) {
                  case "Partie pas encore commencée":
                    return (
                      <div>
                        <div className="row">
                          <div className="six columns">
                            <h5>Ajouter un joueur</h5>
                            <input placeholder="Ex : 0xbB5cF8E0C934E7F346948b9a7a9600a7cb12bfeE" id="newPlayerInput"></input>
                            <br />
                            <button className="button-primary" onClick={this.addToPlayers}>Ajouter le joueur</button>
                          </div>
                          <div className="six columns">
                            <h5>Modifier la taxe obligatoire (en Eth)</h5>
                            <input placeholder="50" type="number" id="newTaxInput"></input>
                            <br />
                            <button className="button-primary" onClick={this.setTax}>Modifier la taxe</button>
                          </div>
                        </div>
                        <div className="row">
                          <div className="six columns">
                            <h5>Assigner nombre à deviner</h5>
                            <input placeholder="50" type="number" id="newNumberToGuessInput"></input>
                            <br />
                            <button className="button-primary" onClick={this.setNumberToGuess}>Modifier le nombre à deviner</button>
                          </div>
                          <div className="six columns">
                            <h5>Démarrer la partie</h5>
                            {
                              this.state.Players.length > 1 && this.state.Tax > 0 && this.state.NumberToGuess > 0 ?
                                <button className="button-primary" onClick={this.startGame}>Démarrer la partie</button>
                                :
                                "Pour démarrer la partie, Veuillez ajouter plus d'un joueur, assigner une taxe et un nombre à deviner"
                            }
                          </div>
                        </div>
                      </div>
                    );
                  case "Partie en cours":
                    return (
                      <div>
                        <div className="row">
                          <div className="six columns">
                            <h5>Proposer un nombre</h5>
                            <input placeholder="50" type="number" id="proposeNumberInput"></input>
                            <br />
                            <button className="button-primary" onClick={this.proposeNumber}>Proposer un nombre</button>
                          </div>
                          <div className="six columns">
                            <h5>Indice</h5>
                            {
                              this.state.Hint !== "" ?
                              this.state.Hint :
                              "Aucun indice pour l'instant"
                            }
                          </div>
                        </div>
                      </div>
                    );
                  case "Partie terminée":
                    return (
                      <div>
                        <div className="row">
                          <div className="six columns">
                            <h5>Gagnant : </h5>
                            <p>{this.state.Winner}</p>
                          </div>
                          <div className="six columns">
                            <h5>Récupérer le pot ({this.state.Pot} Eth)</h5>
                            <button className="button-primary" onClick={this.win}>Récupérer</button>
                          </div>
                        </div>
                        <hr/>
                        <button className="button-primary" onClick={this.resetGame}>Nouvelle partie</button>
                      </div>
                    );
                  default:
                  break;
                }
              })
                ()}
          </div>
          <div className="six columns">
            <h1 style={{fontStyle:'italic'}}>Données du jeu</h1>
            <hr />
            <h4>Nombres proposés</h4>
            {
              this.state.ProposedNumbers.length > 0 ?
                this.state.ProposedNumbers.map((nombre, key) => (
                  <li key={key}>{nombre}</li>
                ))
                :
                "Aucun nombre proposé pour l'instant"
            }
            <hr />
            <h4>Taxe actuelle pour jouer : {this.state.Tax} Eth</h4>
            <hr />
            <h4>Pot (montant total investi) : {this.state.Pot} Eth</h4>
            <hr />
            <h4>Joueurs inscrits</h4>
            {
              this.state.Players.length > 0 ?
                this.state.Players.map((player, key) => (
                  <p key={key}>Adresse du joueur ({key}) : {player}</p>
                ))
                :
                "Aucun joueur n'est inscrit"
            }
            <hr />
            <h4>Joueurs ayant participé au jeu</h4>
            {
              this.state.Played.length > 0 ?
                this.state.Played.map((played, key) => (
                  <p key={key}>Adresse du joueur ({key}) : {played}</p>
                ))
                :
                "Aucun joueur n'a encore joué"
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
