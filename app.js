//variables
const cartBtn=document.querySelector(".cart-btn"),
    closeCartBtn=document.querySelector(".close-cart"),
    clearCartBtn=document.querySelector(".clear-cart"),
    cartDOM=document.querySelector(".cart"),
    cartOverlay=document.querySelector(".cart-overlay"),
    cartItems=document.querySelector(".cart-items"),
    cartTotal=document.querySelector(".cart-total"),
    cartContent=document.querySelector(".cart-content"),
    productsDOM=document.querySelector(".products-center");

//cart
let cart=[];
//buttonDOM
let buttonDOM=[];
//====================getting products==========================
class Products{
    async getProducts(){
        try{
            let result = await fetch(`../products.json`);
            let data=await result.json();
            let products=data.items;
            products=products.map(item=>{
                const {title, price}=item.fields;
                const image=item.fields.image.fields.file.url;
                const {id}=item.sys;
                return  {title, price,image , id};
            })
            return products;
        }catch(error){
            console.log(error);
        }

    }
}
//======================display products========================
class UI{
    displayProducts(products){
        
        let result='';
        products.forEach(product => {
            result+=`
            <!--start single product -->
            <article class="product">
                <div class="img-container">
                    <img src="${product.image}"  class="product-img"alt="">
                    <button class="bag-btn" data-id="${product.id}">
                        <i class="fa fa-shopping-cart"></i>Add To Cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
            <!--end single product -->
            `;
        });
        productsDOM.innerHTML=result;
        
    }
    getBagButtons(){
        const buttons=[...document.querySelectorAll('.bag-btn')];
        buttonDOM=buttons;
        buttons.forEach(button=>{
            let id=button.dataset.id;
            let inCart=cart.find(item=>item.id===id);
            if(inCart){
                button.innerText="In Cart";
                button.disabled=true;
            }
                button.addEventListener("click",e=>{
                    e.target.innerText="In Cart";
                    e.target.disabled=true;
                    //1)get product from products(local storage)
                    let cartItem={...Storage.getProducts(id), amount:1};
                    //2)add product to the cart
                    cart=[...cart, cartItem];
                    //3)save cart to local storage
                    Storage.saveCart(cart);
                    //4)set cart value
                    this.setCardValues(cart);
                    //5)display cart item
                    this.addCartItem(cartItem);
                    //6)show the cart
                    this.showCart();
                })
            
        })
    }
        setCardValues(cart){
            let tempTotal=0;
            let itemTotal=0;
            cart.map(item=>{
                tempTotal+=item.amount*item.price;
                itemTotal+=item.amount;
            })
            cartTotal.innerText=parseFloat(tempTotal.toFixed(2));
            cartItems.innerText=itemTotal;
        }
        addCartItem(item){
            const div=document.createElement('div');
            div.className="cart-item";
            div.innerHTML=`
                    <img src="${item.image}" alt="">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id="${item.id}">remove</span>
                    </div>
                    <div>
                        <i class="fa fa-chevron-up" data-id="${item.id}"></i>
                        <div class="item-amount">1</div>
                        <i class="fa fa-chevron-down" data-id="${item.id}"></i>
                    </div>`;
                    cartContent.appendChild(div);
        }
        showCart(){
            cartOverlay.classList.add("transparentBcg");
            cartDOM.classList.add("showCart");
        }
        setupAPP(){
            cart=Storage.getCart();
            this.setCardValues(cart);
            this.populateCart(cart);
            cartBtn.addEventListener("click",this.showCart);
            closeCartBtn.addEventListener("click",this.hideCart);

        }
        populateCart(cart){
            cart.forEach(item=>{
                this.addCartItem(item);
            })
        }
        hideCart(){
            cartOverlay.classList.remove("transparentBcg");
            cartDOM.classList.remove("showCart");
        }
        cartLogic(){
            //clear cart button
            clearCartBtn.addEventListener("click",()=>this.clearCart());
            //cart functionalities
            cartContent.addEventListener("click",(e)=>{
                if(e.target.classList.contains("remove-item")){
                    let removeItem=e.target;
                    let id =removeItem.dataset.id;
                    cartContent.removeChild(removeItem.parentElement.parentElement);
                    this.removeItem();
                }
                else if(e.target.classList.contains("fa-chevron-up")){
                    let addAmount=e.target;
                    let id=addAmount.dataset.id;
                    let tempItem=cart.find(item=>item.id===id);
                    tempItem.amount=tempItem.amount+1;
                    Storage.saveCart(cart);
                    this.setCardValues(cart);
                    addAmount.nextElementSibling.innerText=tempItem.amount;
                }
                else if(e.target.classList.contains("fa-chevron-down")){
                    let lowerAmount=e.target;
                    let id=lowerAmount.dataset.id;
                    let tempItem=cart.find(item=>item.id===id);
                    tempItem.amount=tempItem.amount-1;
                    if(tempItem.amount>0){
                        Storage.saveCart(cart);
                        this.setCardValues(cart);
                        lowerAmount.previousElementSibling.innerText=tempItem.amount;
                    }else{
                        cartContent.removeChild(lowerAmount.parentElement.parentElement);
                        this.removeItem(id);
                    }
                }
            })
        }
        clearCart(){
            let cartItems=cart.map(item=>item.id);
            cartItems.forEach(id=>this.removeItem(id));
            while(cartContent.children.length>0){
                cartContent.removeChild(cartContent.children[0]);
            }
            this.hideCart();
        }
        removeItem(id){
            cart=cart.filter(item=>item.id!==id);
            this.setCardValues(cart);
            Storage.saveCart(cart);
            let button=this.getSingleButton(id);
            button.disabled=false;
            button.innerHTML= ` <i class="fa fa-shopping-cart"></i>Add To Cart`
        }
        getSingleButton(id){
            return buttonDOM.find(button=>button.dataset.id===id);
        }
    }

//========================local storage===========================
class Storage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    static getProducts(id){
        let products=JSON.parse(localStorage.getItem("products"));
        return products.find(product=>product.id===id);
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}
//=======================event listener==========================
document.addEventListener("DOMContentLoaded", ()=>{
    const products =new Products();
    const ui =new UI();
    //setup App
    ui.setupAPP();
    //get all products
    products.getProducts().then(products=>{
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });

})