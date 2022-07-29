import { GithubUser } from "./GithubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@gitfav-app:')) || []
  }

  save() {
    localStorage.setItem('@gitfav-app:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error(`${username} já está na lista! 😉`)
      } 
      const githubUser = await GithubUser.search(username)

      if(githubUser.login === undefined) {
        throw new Error('Usuário não encontrado! 😥')
      }

      this.entries = [githubUser, ...this.entries]
      this.update()
      this.save()

    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {

  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onAdd()
  }

  onAdd() {
    const favoriteButton = this.root.querySelector('.search button')
    favoriteButton.onclick = () => {
      const { value } = this.root.querySelector('#input-search')
      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = `${user.public_repos}`
      row.querySelector('.followers').textContent = `${user.followers}`

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm(`Deseja deletar ${user.name} da lista?`)

        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })


  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
          <td class="user">
              <img src="https://github.com/GabrielDiasz.png" alt="">
              <a href="#" target="_blank">
                <p>Gabriel Dias</p>
                <span>/GabrielDiasz</span>
              </a>
          </td>

          <td class="repositories">
              18
          </td>
      
          <td class="followers">
              78
          </td>
      
          <td class="remove">
            <button>Remover</button>
          </td>
    `

    return tr
  }

  removeAllTr() {
    const tableBorder = this.root.querySelector('.table-border tbody')

    this.tbody.querySelectorAll(' tr').
      forEach((tr) => {
        tr.remove()
      })

    if (this.entries.length === 0) {
      tableBorder.classList.add('clean-table')
    } else {
      tableBorder.classList.remove('clean-table')
    }
  }
}