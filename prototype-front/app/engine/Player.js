//   classe abstraite (non utilisée directement) 

class Player {
    constructor(id, color){
        this.id = id //1 ou 2
        this.color = color// blanc/noire
    }
// methodes

    getId() {
        return this.id
      }
    
    getColor() {
        return this.color
    }
//oblige tt sous classe a l'implémenter

    playMove() {
        throw new Error("playMove besoin d'etre implementé")
    }

} 




